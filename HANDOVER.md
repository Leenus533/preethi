# Live site

**https://preethi-tutoring.vercel.app**  \n(moving to https://tutoring.preethi.co.uk once DNS is set, see below)

Everything is deployed and working. Stripe, the webhook and Google Calendar all report healthy at
`/api/health?deep=1`.

A real test booking has already gone end to end in production: £30 paid, webhook delivered, event
created in Preethi's calendar with a Google Meet link, invitation emailed to the student. Nothing
is left to wire up.

## The one thing still outstanding: real money

The site is running on Stripe **test** keys. Card `4242 4242 4242 4242` works, real cards do not.

To take real payments:

1. In the Stripe dashboard, complete the business profile for the account. Stripe will ask Preethi
   for identity documents and bank details before it releases payouts. This is the slow part and
   only she can do it.
2. Copy the live secret key (`sk_live_…`) from <https://dashboard.stripe.com/apikeys>.
3. Replace `STRIPE_SECRET_KEY` in `.env.local`, delete the `STRIPE_WEBHOOK_SECRET` line entirely,
   then run `./scripts/deploy.sh`. It creates a fresh live-mode webhook and redeploys.

Also worth doing in Stripe: Settings → Public details, so the checkout page shows a sensible
business name. Right now it says "acupuncture.preethi.co.uk".

## Custom domain: one DNS record left

The site will live at **https://tutoring.preethi.co.uk**, and **preethi.co.uk** is already set to
308-redirect there. Both are attached to the Vercel project. The only missing piece is DNS.

Your domain uses Cloudflare nameservers (`nile.ns.cloudflare.com`, `candy.ns.cloudflare.com`), so
in the Cloudflare dashboard add:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| CNAME | `tutoring` | `cname.vercel-dns.com.` | DNS only (grey cloud) |
| A | `@` | `76.76.21.21` | DNS only (grey cloud) |

The CNAME serves the site. The A record makes the bare `preethi.co.uk` reach Vercel so the redirect
to the subdomain can fire. Turn the orange proxy cloud **off** for both, or Vercel cannot issue the
TLS certificate.

Then run `./scripts/deploy.sh` once more. It checks the live DNS itself and only switches the
public URL over to the custom domain once that domain genuinely resolves. Until then it keeps using
the vercel.app address, so a student paying today still lands on a working confirmation page rather
than a dead one. You do not have to remember the ordering; just re-run the script after the DNS
records go in.

## Keep the Google connection alive

In Google Cloud Console, on the OAuth consent screen, press **Publish app**. While it says
"Testing", Google expires the refresh token after 7 days and bookings will stop without warning.
Publishing needs no verification review for a single-user app like this.

If bookings ever do stop, `/api/health?deep=1` will say so, and `npm run google:auth` followed by
`./scripts/deploy.sh` reconnects it.

## Tidying up after testing

Your test booking is still on the calendar: GCSE tutoring, Thursday 3 September, 18:30. Delete the
event in Google Calendar when you no longer need it. Deleting it frees the slot again automatically.

## Changing prices, hours and copy

All in `src/lib/config.ts`, then `./scripts/deploy.sh`:

- Prices: £30 GCSE, £35 A-level, £40 UCAT and med-school coaching, per 60 minutes.
- Free intro call: 20 minutes.
- Hours: weekdays 17:00–21:00, weekends 09:00–17:00, UK time.
- 24 hours' minimum notice, 15-minute gap around existing events, bookable 60 days ahead.
- `SHOW_PHONE=yes` in `.env.local` puts her mobile number on the site. It is currently hidden.

To block time off, just put an ordinary event in her Google Calendar. Anything marked Busy removes
those slots from the site automatically.

Page copy is in `src/components/home/Sections.tsx`. Two claims are worth Preethi checking before
you share the site: that she covers AQA, Edexcel and OCR, and the GCSE subject list, which includes
Physics and Combined Science.

If you have a photo of her, save it as `public/preethi.jpg` and redeploy. The hero picks it up
automatically; right now it shows a monogram card.
