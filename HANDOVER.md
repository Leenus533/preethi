# Live site

**https://preethi-tutoring.vercel.app**

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

## Custom domain

`preethi.co.uk` is attached to the Vercel project but does not resolve, because it has no DNS
records. Its nameservers are Cloudflare (`nile.ns.cloudflare.com`, `candy.ns.cloudflare.com`), so
add one of these in the Cloudflare dashboard:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com.` |

Set the Cloudflare proxy to **DNS only** (grey cloud), not proxied.

Note the Stripe account is named "acupuncture.preethi.co.uk", so the apex domain may be intended
for her acupuncture site. If so, use `tutoring.preethi.co.uk` instead: change `CUSTOM_DOMAIN` in
`.env.local`, add a CNAME for `tutoring` pointing at `cname.vercel-dns.com.`, and re-run the deploy
script.

Once DNS resolves, set `NEXT_PUBLIC_SITE_URL=https://<the domain>` in `.env.local` and deploy again,
so Stripe redirects and page metadata use the real address.

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
