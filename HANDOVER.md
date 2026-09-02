# Live site

**https://preethi.co.uk**

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

## Domains

Everything is done. No further DNS work is needed.

| Address | Behaviour |
| --- | --- |
| `preethi.co.uk` | Serves the tutoring site. This is the canonical address. |
| `www.preethi.co.uk` | 308-redirects to the apex. |
| `tuition.preethi.co.uk` | 308-redirects to the apex, so the old address still works. |
| `preethi-tutoring.vercel.app` | Still works. The Stripe webhook points here, which is deliberate: it keeps working even if the custom domain changes. |
| `acupuncture.preethi.co.uk` | Untouched, still serving the old acupuncture site. |

The old `preethi-tuition` Vercel project no longer owns any domain, so its brochure site is off the
public internet. The project itself still exists if you ever want anything from it.

If a browser says the site cannot be reached shortly after a DNS change, it is almost always a
stale cache rather than a real fault. Cloudflare tells resolvers to remember a "does not exist"
answer for thirty minutes. Either wait that out, or clear it immediately: in Chrome open
`chrome://net-internals/#dns` and press Clear host cache, then hard-reload.

Mail is unaffected. The Resend records (`send`, `_dmarc`, `resend._domainkey`) were left exactly as
they were.

To take the acupuncture site down too, remove the `acupuncture` CNAME in Cloudflare, or detach the
domain from the `preethi` project in Vercel. I left it alone because deleting it is the one action
that cannot be undone with a click.

## Keep the Google connection alive

In Google Cloud Console, on the OAuth consent screen, press **Publish app**. While it says
"Testing", Google expires the refresh token after 7 days and bookings will stop without warning.
Publishing needs no verification review for a single-user app like this.

If bookings ever do stop, `/api/health?deep=1` will say so, and `npm run google:auth` followed by
`./scripts/deploy.sh` reconnects it.

## Tidying up after testing

Your test booking is still on the calendar: GCSE tutoring, Thursday 3 September, 18:30. Delete the
event in Google Calendar when you no longer need it. Deleting it frees the slot again automatically.

## Check the prices before sharing the site

Your previous tuition site advertised different prices from the ones on this site. I used the
defaults I proposed at the start, not the ones she had published.

| Session | Old site | This site |
| --- | --- | --- |
| GCSE | £25/hr | £30/hr |
| A-level | £30/hr | £35/hr |
| Medical school prep | £35/hr | £40/hr, split into UCAT and applications |

Tell me which set is right and I will change it in a minute. Two other differences worth Preethi
confirming: the old site offered A-level Physics, which this one does not, since her own A-levels
were Biology, Chemistry and Maths. And the old site described her as a fourth-year student, while
this one says final-year, which matches her CV for the year starting September 2026.

## Changing prices, hours and copy

All in `src/lib/config.ts`, then `./scripts/deploy.sh`:

- Prices: £30 GCSE, £35 A-level, £40 UCAT and med-school coaching, per 60 minutes.
- Free intro call: 20 minutes.
- Hours: weekdays 17:00–21:00, weekends 09:00–17:00, UK time.
- 24 hours' minimum notice, 15-minute gap around existing events, bookable 60 days ahead.
- `SHOW_PHONE=yes` in `.env.local` puts her mobile number on the site. It is currently hidden.

To block time off, just put an ordinary event in her Google Calendar. Anything marked Busy removes
those slots from the site automatically.

Home page copy is in `src/components/home/Sections.tsx`; the four subject pages under `/tutoring/`
are written in `src/lib/subjects.ts`. Two claims are worth Preethi checking before you share the
site: that she covers AQA, Edexcel and OCR, and the GCSE subject list, which includes Physics and
Combined Science. The subject pages repeat only facts already on the home page, but she should read
them once.

## Photo

The hero no longer shows a photograph; it shows an illustrated study board instead. The photo that
was briefly used is out of the repository but still in git history (commit `5453cfb`) if you want
it back later. Adding it again is a small design change, not a file drop.
