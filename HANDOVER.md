# Live site

**https://preethi.co.uk**

Everything is deployed and working. Stripe, the webhook and Google Calendar all report healthy at
`/api/health?deep=1`.

A real test booking has already gone end to end in production: £30 paid, webhook delivered, event
created in Preethi's calendar with a Google Meet link, invitation emailed to the student. Nothing
is left to wire up.

## Emails (added 3 September 2026)

Every confirmed booking, paid or free, now sends two emails from `bookings@preethi.co.uk` via
Resend, on top of Google's calendar invitation and Stripe's receipt:

- **To the student:** "Booked: A-level tutoring, Mon 5 Oct, 17:00". Session details, the Google
  Meet button, what to have ready, and how to reschedule (reply to the email, 24 hours' notice).
  Replies go to `NOTIFY_EMAIL`, so Preethi sees them.
- **To Preethi** (`NOTIFY_EMAIL`, defaults to `CONTACT_EMAIL`): "New booking: A-level tutoring
  with Tom Example, Mon 5 Oct, 17:00". Student and parent details, year group, the notes they
  typed, payment with a link to the Stripe dashboard, and buttons for the calendar event and Meet.
  Replies go straight to the student. If payment landed after the hold expired and the slot now
  overlaps another event, the subject starts with **CLASH:** and the email says what to do.

Email is a courtesy on top of the calendar. If Resend is down or the key is missing, the booking
is still recorded and Google still sends the invitation; the sender swallows every error, so the
webhook cannot fail because of email. Each send carries an idempotency key derived from the booking
reference, which Resend honours for 24 hours, so webhook retries in that window (the normal case)
do not duplicate emails.

Setup that is already done: `preethi.co.uk` is verified in Resend (EU region), the old DKIM record
in Cloudflare was replaced with the new key, and a sending-only API key restricted to that domain
is in `.env.local` as `RESEND_API_KEY`. `./scripts/deploy.sh` pushes `RESEND_API_KEY`,
`EMAIL_FROM` and `NOTIFY_EMAIL` to Vercel with everything else. `/api/health` reports
`email.configured`. Resend's free tier allows 3,000 emails a month and 100 a day; a booking uses two.

To see what went out, or why something did not, open <https://resend.com/emails>.

## The one thing still outstanding: real money

The site is running on Stripe **test** keys. Card `4242 4242 4242 4242` works, real cards do not.

The live Stripe account (`acct_1T7txmPnTu25YBhc`) is already prepared:

- Three active products with £30/£35/£30 default prices, one per paid service, each tagged with a
  `serviceId` in its metadata. (UCAT preparation was merged into "UCAT and medical school
  coaching" on 3 September 2026; the old UCAT product is archived, not deleted, so past payments
  keep their history.) Checkout looks products up by that tag so payments group per
  service in Stripe reporting; the amount charged always comes from `src/lib/config.ts`.
- A live webhook endpoint for `https://preethi.co.uk/api/webhooks/stripe` listening to the four
  `checkout.session.*` events the handler uses. Its signing secret is under Developers → Webhooks
  (Reveal).
- Checkout branding set to the site's colours (pine buttons, cream background, Inter).

Still to do, in order:

1. Preethi activates the account at <https://dashboard.stripe.com/account/onboarding>: accept the
   terms, set business type, website `https://preethi.co.uk`, support phone, a one-line product
   description, identity check and bank account. Until then `charges_enabled` is false and every
   live payment is refused. Suggested public business name and statement descriptor:
   `Preethi Amudhan Tutoring` / `PREETHI TUTORING`.
2. Upload the icon in Settings → Branding (use <https://preethi.co.uk/apple-icon>). The API
   refused the upload.
3. In Vercel → Project → Settings → Environment Variables (Production), set `STRIPE_SECRET_KEY`
   to the live key from <https://dashboard.stripe.com/apikeys> and `STRIPE_WEBHOOK_SECRET` to
   the live webhook's signing secret, then redeploy. `/api/health` should then report
   `"mode":"live"`.
4. Optional: Settings → Emails → turn on "Successful payments" so students get receipts from
   Stripe as well as the calendar invitation and the site's own confirmation email. Note that
   `receipt_email` is set on every payment, so in live mode Stripe sends a receipt regardless.

## Bulk sessions

Bulk sessions have their own card in the pricing section: 20% off the session rate, tailored and
priced to the student, arranged by email or phone (or on the intro call) rather than online, so the
card shows contact details instead of a Book button. The figure lives in `src/lib/config.ts` as
`blockDiscountPercent` and also feeds the FAQ, the booking page note and the intro-call email.
Nothing enforces it in Stripe: Preethi takes payment for bulk sessions however she likes (a payment
link from the Stripe dashboard works well).

## Domains

Everything is done. No further DNS work is needed.

| Address | Behaviour |
| --- | --- |
| `preethi.co.uk` | Serves the tutoring site. This is the canonical address. |
| `www.preethi.co.uk` | 308-redirects to the apex. |
| `tuition.preethi.co.uk` | 308-redirects to the apex, so the old address still works. |
| `preethi-tutoring.vercel.app` | Still works. The test-mode Stripe webhook points here; the live one points at `preethi.co.uk`. |
| `acupuncture.preethi.co.uk` | Untouched, still serving the old acupuncture site. |

The old `preethi-tuition` Vercel project no longer owns any domain, so its brochure site is off the
public internet. The project itself still exists if you ever want anything from it.

If a browser says the site cannot be reached shortly after a DNS change, it is almost always a
stale cache rather than a real fault. Cloudflare tells resolvers to remember a "does not exist"
answer for thirty minutes. Either wait that out, or clear it immediately: in Chrome open
`chrome://net-internals/#dns` and press Clear host cache, then hard-reload.

Mail: the Resend records now belong to the tutoring site's Resend team. `resend._domainkey` holds
the new DKIM key, `send` keeps its MX and SPF records, and a `resend-domain-verification` TXT on the
apex proves the domain claim. `_dmarc` is still `p=none`.

Inbound mail to `bookings@preethi.co.uk` is handled by Cloudflare Email Routing (free), enabled on
3 September 2026. It added the `route*.mx.cloudflare.net` MX records, an apex SPF record and a
`cf2024-1._domainkey` DKIM record. A rule forwards `bookings@preethi.co.uk` to
`preethinorwich@gmail.com` (the Gmail address was verified the same day). Other addresses at the
domain are not forwarded; add rules under Cloudflare → Email → Email Routing if needed.

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
| Medical school prep | £35/hr | £30/hr, UCAT and applications in one session type (was £40 and split until 3 September 2026) |

Tell me which set is right and I will change it in a minute. One other difference worth Preethi
confirming: the old site described her as a fourth-year student, while this one says final-year,
which matches her CV for the year starting September 2026.

The site now offers any GCSE or A-level subject, with Maths and the sciences described as her
specialisms (the subjects her own results are in). If she wants to narrow that again, the wording
lives in `src/lib/config.ts` (taglines and highlights) and `src/lib/subjects.ts` (the GCSE and
A-level pages).

## Changing prices, hours and copy

All in `src/lib/config.ts`, then `./scripts/deploy.sh`:

- Prices: £30 GCSE, £35 A-level, £30 UCAT and medical school coaching (one session type), per 60 minutes.
- Bulk sessions: 20% off, their own pricing card plus a note on the booking page (`blockDiscountPercent` in `src/lib/config.ts`).
- Free intro call: 20 minutes.
- Hours: weekdays 17:00–21:00, weekends 09:00–17:00, UK time.
- 24 hours' minimum notice for paid sessions and 8 hours for the free intro call (`minNoticeHours` on the service), 15-minute gap around existing events, bookable 60 days ahead.
- Her mobile number (07448 609 094) is shown in the footer and in the structured data. To hide it, set `showPhone: false` in `src/lib/config.ts`.

To block time off, just put an ordinary event in her Google Calendar. Anything marked Busy removes
those slots from the site automatically.

Home page copy is in `src/components/home/Sections.tsx`; the four subject pages under `/tutoring/`
are written in `src/lib/subjects.ts`. One claim is worth Preethi checking before you share the
site: that she covers AQA, Edexcel and OCR. The subject pages repeat only facts already on the home
page, but she should read them once.

## Photo

The hero no longer shows a photograph; it shows an illustrated study board instead. The photo that
was briefly used is out of the repository but still in git history (commit `5453cfb`) if you want
it back later. Adding it again is a small design change, not a file drop.
