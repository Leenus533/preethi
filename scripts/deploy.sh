#!/usr/bin/env bash
# Deploy to Vercel production, sync environment variables, and wire up the Stripe webhook.
#
#   ./scripts/deploy.sh
#
# Auth: VERCEL_TOKEN in .env.local (https://vercel.com/account/tokens), or a logged-in Vercel CLI
# (`npx vercel login`), whose token is read from the CLI's auth file.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="${VERCEL_PROJECT_NAME:-preethi-tutoring}"
VERCEL_PKG="${VERCEL_PKG:-vercel@latest}"

# --- load .env.local (values may contain spaces; surrounding quotes are stripped) --------
if [ -f .env.local ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^[A-Z_][A-Z0-9_]*= ]] || continue
    key="${line%%=*}"; val="${line#*=}"
    val="${val%$'\r'}"
    if [[ "$val" == \"*\" && "$val" == *\" ]]; then val="${val:1:${#val}-2}"; fi
    if [[ "$val" == \'*\' && "$val" == *\' ]]; then val="${val:1:${#val}-2}"; fi
    export "$key=$val"
  done < .env.local
fi

# Fall back to the token stored by `vercel login`.
if [ -z "${VERCEL_TOKEN:-}" ]; then
  for f in "${XDG_DATA_HOME:-$HOME/.local/share}/com.vercel.cli/auth.json" "$HOME/Library/Application Support/com.vercel.cli/auth.json" "$HOME/.config/com.vercel.cli/auth.json"; do
    if [ -f "$f" ]; then
      VERCEL_TOKEN=$(node -e 'try{console.log(require(process.argv[1]).token||"")}catch{console.log("")}' "$f")
      [ -n "$VERCEL_TOKEN" ] && { export VERCEL_TOKEN; echo "==> Using token from $f"; break; }
    fi
  done
fi
if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "No Vercel credentials. Put VERCEL_TOKEN in .env.local or run: npx vercel login" >&2
  exit 1
fi
# The CLI reads VERCEL_TOKEN from the environment, so the secret never appears on a command line.
vc() { npx --yes "$VERCEL_PKG" "$@"; }
vapi() { curl -sS -K <(printf 'header = "Authorization: Bearer %s"\n' "$VERCEL_TOKEN") "$@"; }
sapi() { curl -sS -K <(printf 'user = "%s:"\n' "$STRIPE_SECRET_KEY") "$@"; }

echo "==> Linking project '$PROJECT'"
vc link --yes --project "$PROJECT" >/dev/null

TEAM_QS=""
ORG_ID=$(node -e 'try{console.log(require("./.vercel/project.json").orgId||"")}catch{console.log("")}')
PROJECT_ID=$(node -e 'try{console.log(require("./.vercel/project.json").projectId||"")}catch{console.log("")}')
case "$ORG_ID" in team_*) TEAM_QS="?teamId=$ORG_ID";; esac
[ -n "$PROJECT_ID" ] || { echo "Could not read .vercel/project.json after linking" >&2; exit 1; }

# --- production host (<project>.vercel.app or whatever Vercel assigned) -------------------
PROD_HOST=$(vapi "https://api.vercel.com/v9/projects/$PROJECT_ID/domains$TEAM_QS" \
  | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));const v=(d.domains||[]).filter(x=>/\.vercel\.app$/.test(x.name)).map(x=>x.name);console.log(v[0]||"")')
[ -n "$PROD_HOST" ] || { echo "Could not determine the production *.vercel.app host" >&2; exit 1; }
PROD_URL="https://$PROD_HOST"
echo "    production host: $PROD_HOST"

# --- Stripe: only live keys ever reach production ------------------------------------------
# Production holds the live secret key and the live webhook's signing secret. Unless .env.local
# holds a live key (sk_live_ or rk_live_), the two Stripe variables are left untouched and the
# webhook step is skipped, so a local test setup, a missing key, or a stale test webhook secret
# can never downgrade the live site. FORCE_STRIPE_ENV=1 overrides this deliberately.
SKIP_STRIPE=yes
case "${STRIPE_SECRET_KEY:-}" in sk_live_*|rk_live_*) SKIP_STRIPE=no;; esac
if [ "${FORCE_STRIPE_ENV:-}" = "1" ]; then
  SKIP_STRIPE=no
  echo "==> FORCE_STRIPE_ENV=1: Stripe variables from .env.local WILL be pushed to production"
elif [ "$SKIP_STRIPE" = "yes" ]; then
  echo "==> .env.local has no live Stripe key; leaving production's STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET untouched"
  echo "    (put the live key and the live webhook's signing secret in .env.local to change them)"
fi

# --- Stripe webhook (before the deploy, so the secret is part of the same build) ------------
if [ -n "${STRIPE_SECRET_KEY:-}" ] && [ "$SKIP_STRIPE" = "no" ]; then
  WEBHOOK_URL="$PROD_URL/api/webhooks/stripe"
  echo "==> Ensuring Stripe webhook endpoint for $WEBHOOK_URL"
  EXISTING=$(sapi "https://api.stripe.com/v1/webhook_endpoints?limit=100" \
    | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));const u=process.argv[1];console.log((d.data||[]).find(w=>w.url===u&&w.status==="enabled")?.id||"")' "$WEBHOOK_URL")
  if [ -n "$EXISTING" ] && [ -z "${STRIPE_WEBHOOK_SECRET:-}" ]; then
    # A signing secret can only be read at creation time; recreate the endpoint so we have it.
    echo "    endpoint $EXISTING exists but no local secret; recreating it"
    sapi -X DELETE "https://api.stripe.com/v1/webhook_endpoints/$EXISTING" >/dev/null
    EXISTING=""
  fi
  if [ -n "$EXISTING" ]; then
    echo "    endpoint $EXISTING already exists; using STRIPE_WEBHOOK_SECRET from .env.local"
  else
    RESP=$(sapi https://api.stripe.com/v1/webhook_endpoints \
      -d url="$WEBHOOK_URL" \
      -d description="Tutoring bookings ($PROD_HOST)" \
      -d "enabled_events[]=checkout.session.completed" \
      -d "enabled_events[]=checkout.session.expired" \
      -d "enabled_events[]=checkout.session.async_payment_succeeded" \
      -d "enabled_events[]=checkout.session.async_payment_failed")
    STRIPE_WEBHOOK_SECRET=$(printf '%s' "$RESP" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));if(d.error){console.error(d.error.message);process.exit(1)}console.log(d.secret)')
    export STRIPE_WEBHOOK_SECRET
    if grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local 2>/dev/null; then
      node -e 'const fs=require("fs");let t=fs.readFileSync(".env.local","utf8");t=t.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m,"STRIPE_WEBHOOK_SECRET="+process.argv[1]);fs.writeFileSync(".env.local",t)' "$STRIPE_WEBHOOK_SECRET"
    else
      printf '\nSTRIPE_WEBHOOK_SECRET=%s\n' "$STRIPE_WEBHOOK_SECRET" >> .env.local
    fi
    echo "    created endpoint; signing secret saved to .env.local"
  fi
fi

# --- public site URL -------------------------------------------------------------------------
# Stripe redirects the student to NEXT_PUBLIC_SITE_URL after paying, so it must be a hostname that
# actually resolves. Only use the custom domain once its DNS is live; otherwise fall back to the
# vercel.app host so a booking never lands on a dead page.
if [[ "${NEXT_PUBLIC_SITE_URL:-}" == *localhost* ]]; then unset NEXT_PUBLIC_SITE_URL; fi
DOMAIN_READY=no
if [ -n "${CUSTOM_DOMAIN:-}" ]; then
  DOMAIN_READY=$(vapi "https://api.vercel.com/v6/domains/$CUSTOM_DOMAIN/config" \
    | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(d.misconfigured?"no":"yes")')
fi
if [ "$DOMAIN_READY" = "yes" ]; then
  NEXT_PUBLIC_SITE_URL="https://$CUSTOM_DOMAIN"
  echo "==> Public URL: $NEXT_PUBLIC_SITE_URL (custom domain DNS is live)"
else
  NEXT_PUBLIC_SITE_URL="$PROD_URL"
  if [ -n "${CUSTOM_DOMAIN:-}" ]; then
    echo "==> Public URL: $PROD_URL (holding off on $CUSTOM_DOMAIN until its DNS resolves)"
  fi
fi
export NEXT_PUBLIC_SITE_URL

# --- environment variables -----------------------------------------------------------------
echo "==> Syncing environment variables to production"
for key in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN \
           GOOGLE_CALENDAR_ID GOOGLE_BUSY_CALENDAR_IDS NEXT_PUBLIC_SITE_URL CUSTOM_DOMAIN SITE_NAME CONTACT_EMAIL \
           RESEND_API_KEY EMAIL_FROM NOTIFY_EMAIL; do
  val="${!key:-}"
  [ -z "$val" ] && continue
  if [ "$SKIP_STRIPE" = "yes" ]; then case "$key" in STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET) continue;; esac; fi
  vc env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$val" | vc env add "$key" production >/dev/null
  echo "    $key"
done

# --- deploy --------------------------------------------------------------------------------
echo "==> Deploying to production"
DEPLOY_URL=$( (vc deploy --prod --yes 2>/dev/null | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | tail -n1) || true)
echo "    deployment: ${DEPLOY_URL:-(see output above)}"

# --- custom domain -------------------------------------------------------------------------
# CUSTOM_DOMAIN is where the site lives. REDIRECT_DOMAINS is an optional comma-separated list of
# other domains (typically the bare apex) that should 308-redirect to it.
if [ -n "${CUSTOM_DOMAIN:-}" ]; then
  echo "==> Attaching $CUSTOM_DOMAIN"
  vapi -X POST -H "Content-Type: application/json" \
    "https://api.vercel.com/v10/projects/$PROJECT_ID/domains$TEAM_QS" \
    -d "{\"name\":\"$CUSTOM_DOMAIN\"}" \
    | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));const e=d.error;console.log("    "+(!e?d.name+" attached":/already in use/.test(e.message)?"already attached":e.message))'

  for redir in ${REDIRECT_DOMAINS//,/ }; do
    [ -z "$redir" ] && continue
    echo "==> Pointing $redir at $CUSTOM_DOMAIN"
    vapi -X POST -H "Content-Type: application/json" \
      "https://api.vercel.com/v10/projects/$PROJECT_ID/domains$TEAM_QS" \
      -d "{\"name\":\"$redir\"}" >/dev/null 2>&1 || true
    vapi -X PATCH -H "Content-Type: application/json" \
      "https://api.vercel.com/v9/projects/$PROJECT_ID/domains/$redir$TEAM_QS" \
      -d "{\"redirect\":\"$CUSTOM_DOMAIN\",\"redirectStatusCode\":308}" \
      | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log("    "+(d.error?d.error.message:"redirects to "+d.redirect))'
  done

  # Remind the operator what DNS still has to be set at the registrar.
  vapi "https://api.vercel.com/v6/domains/$CUSTOM_DOMAIN/config" | node -e '
    const d=JSON.parse(require("fs").readFileSync(0,"utf8"));
    if (d.misconfigured) {
      console.log("    DNS NOT SET YET. At your DNS provider add:");
      const c=(d.recommendedCNAME||[]).map(x=>x.value)[0];
      const a=(d.recommendedIPv4||[]).map(x=>x.value).flat()[0];
      console.log("      CNAME  "+process.argv[1]+"  ->  "+(c||"cname.vercel-dns.com."));
      console.log("      (or an A record to "+(a||"76.76.21.21")+" for a bare apex domain)");
    } else {
      console.log("    DNS is configured.");
    }' "$CUSTOM_DOMAIN"
fi

echo
echo "Done. Production: $PROD_URL"
echo "Health: $PROD_URL/api/health?deep=1"
