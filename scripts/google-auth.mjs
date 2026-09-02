#!/usr/bin/env node
/**
 * One-time Google Calendar authorisation.
 *
 * Usage:  node scripts/google-auth.mjs
 *
 * Reads GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET from .env.local, prints a link,
 * waits for the Google consent redirect on a local port, exchanges the code for
 * a refresh token and writes it back into .env.local as GOOGLE_REFRESH_TOKEN.
 *
 * Sign in as the Google account whose calendar should receive the bookings.
 * No dependencies: plain Node 18+.
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

function readEnv() {
  if (!existsSync(ENV_PATH)) throw new Error(`.env.local not found at ${ENV_PATH}`);
  const out = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function writeEnvValue(key, value) {
  let text = readFileSync(ENV_PATH, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(text)) text = text.replace(re, `${key}=${value}`);
  else text += `\n${key}=${value}\n`;
  writeFileSync(ENV_PATH, text);
}

const env = readEnv();
const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env.local first.");
  process.exit(1);
}

const server = createServer();
const PORT = Number(process.env.GOOGLE_AUTH_PORT || 53682);
await new Promise((r, rej) => { server.on("error", rej); server.listen(PORT, "127.0.0.1", r); }).catch((e) => {
  console.error(`Could not listen on port ${PORT} (${e.code}). Another copy may already be running.`);
  process.exit(1);
});
const port = PORT;
const redirectUri = `http://localhost:${port}/`;

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES.join(" "));
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");
authUrl.searchParams.set("include_granted_scopes", "true");

console.log("\n1. Open this link in a browser where you can sign in as Preethi's Google account:\n");
console.log(authUrl.toString());
console.log("\n2. Click Allow. You will be redirected to a localhost page that says 'Done'.\n");
console.log("   (The link is valid for as long as this script is running, up to 12 hours.)");
console.log(`Waiting on http://localhost:${port}/ ...`);

const code = await new Promise((resolveCode, reject) => {
  const timer = setTimeout(() => reject(new Error("Timed out after 12 hours")), 12 * 60 * 60 * 1000);
  server.on("request", (req, res) => {
    const url = new URL(req.url, redirectUri);
    const err = url.searchParams.get("error");
    const c = url.searchParams.get("code");

    // Anything that is not the Google redirect (a favicon request, someone opening this URL
    // directly) must not kill the server, or the link becomes single-use by accident.
    if (!c && !err) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>Still waiting</h1><p>This page only works as the destination of the Google consent screen. " +
          "Go back to the terminal, copy the accounts.google.com link, open that, and click Allow.</p>",
      );
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (err || !c) {
      res.end(`<h1>Authorisation failed</h1><p>${err ?? "no code"}</p><p>Run the script again and retry.</p>`);
      clearTimeout(timer);
      reject(new Error(err ?? "no code returned"));
      return;
    }
    res.end("<h1>Done</h1><p>You can close this tab and go back to the terminal.</p>");
    clearTimeout(timer);
    resolveCode(c);
  });
});
server.close();

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }),
});
const tokens = await tokenRes.json();
if (!tokenRes.ok || !tokens.refresh_token) {
  console.error("Token exchange failed:", JSON.stringify(tokens, null, 2));
  console.error("\nIf there is no refresh_token, revoke the app at https://myaccount.google.com/permissions and run again.");
  process.exit(1);
}

// Sanity check: who did we authorise as, and can we see the calendar?
const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
  headers: { Authorization: `Bearer ${tokens.access_token}` },
});
const cal = await calRes.json();

writeEnvValue("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
console.log(`\nSuccess. Authorised calendar: ${cal.summary ?? cal.id ?? "(unknown)"} (${cal.timeZone ?? "?"})`);
console.log("GOOGLE_REFRESH_TOKEN has been written to .env.local.\n");
