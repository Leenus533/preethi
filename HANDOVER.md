# Where this got to, and what is left

The site is built, tested and running locally. It is **not deployed yet**, because `VERCEL_TOKEN`
in `.env.local` is still empty. The Google Calendar link is also still pending one click.

## Two things only you can do

### 1. Vercel token (2 minutes) — this is what blocks deployment

Go to <https://vercel.com/account/tokens>, create a token (scope: Full Account), and paste it into
`.env.local` next to `VERCEL_TOKEN=`. Then run:

```bash
./scripts/deploy.sh
```

That single command links the project, creates the Stripe webhook, pushes every environment
variable and deploys to production. It prints the live URL at the end.

Alternative if you would rather not make a token: run `npx vercel login` first, then the same
script. It will find the CLI's credentials on its own.

### 2. Google Calendar consent (1 click) — bookings stay off until this is done

A script has been waiting in the background all night. If it is still running, open this and click
Allow while signed in as the Google account that owns Preethi's calendar:

```
http://localhost:53682/
```

If that page does not respond, the script has stopped. Start it again and use the link it prints:

```bash
npm run google:auth
```

It writes `GOOGLE_REFRESH_TOKEN` into `.env.local` by itself. Re-run `./scripts/deploy.sh`
afterwards to push it to Vercel.

One extra step worth doing while you are in Google Cloud Console: on the OAuth consent screen,
press **Publish app**. While it says "Testing", Google expires the refresh token after 7 days and
bookings would silently stop. Publishing needs no verification for a single-user app like this.

## Decisions I made that you may want to change

All in `src/lib/config.ts`, one edit and a redeploy:

- Prices: £30 GCSE, £35 A-level, £40 UCAT and med-school coaching, per 60-minute session.
- Free intro call is 20 minutes.
- Hours: weekdays 17:00 to 21:00, weekends 09:00 to 17:00, UK time.
- 24 hours' minimum notice, 15-minute gap around existing calendar events, bookable 60 days ahead.
- Her mobile number is not on the site. Set `SHOW_PHONE=yes` in `.env.local` to add it.

Site copy lives in `src/components/home/Sections.tsx`. Everything factual on the page comes from
her CV. Two claims are worth her eye before you tell anyone about the site: that she covers AQA,
Edexcel and OCR, and the GCSE subject list including Physics and Combined Science.

If you have a photo of her, save it as `public/preethi.jpg` and redeploy. The hero uses it
automatically; right now it shows a monogram card instead.

## Custom domain

`.env.local` has `CUSTOM_DOMAIN=preethi.co.uk`. The deploy script attaches it to the project, but
DNS still has to point at Vercel, and note that your Stripe account is named
"acupuncture.preethi.co.uk", so that apex domain may already be in use for her acupuncture site. A
subdomain such as `tutoring.preethi.co.uk` would avoid a clash. Change the value and re-run the
script if so.

## Payments: test mode versus real money

The key in `.env.local` is a **test** key (`sk_test_`). Everything works end to end, but no real
money moves. Card `4242 4242 4242 4242`, any future expiry, any CVC.

To go live: swap in the `sk_live_` key from the Stripe dashboard and re-run `./scripts/deploy.sh`.
The script creates a fresh live-mode webhook automatically. Stripe will ask Preethi for identity
and bank details before it releases payouts. That is the part I said would need her, and it has not
been started.

## Checking it is healthy after deploying

```
https://<your-url>/api/health?deep=1
```

Returns `ok: true` only when Stripe, the webhook secret and the calendar are all working. Anything
else returns 503 with a breakdown of which piece is missing.
