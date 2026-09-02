import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { siteOrigin } from "../src/lib/site-url";

type Req = { headers: Headers; nextUrl: URL };
function req(headers: Record<string, string>, url = "https://preethi-tutoring.vercel.app/api/checkout"): Req {
  return { headers: new Headers(headers), nextUrl: new URL(url) };
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  delete process.env.VERCEL_URL;
  delete process.env.CUSTOM_DOMAIN;
});

test("an explicit site URL always wins", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://preethi.co.uk/";
  const r = req({ "x-forwarded-host": "evil.example.com" }) as never;
  assert.equal(siteOrigin(r), "https://preethi.co.uk");
});

test("a spoofed forwarded host is ignored in favour of the known production URL", () => {
  process.env.VERCEL_PROJECT_PRODUCTION_URL = "preethi-tutoring.vercel.app";
  const r = req({ "x-forwarded-host": "evil.example.com", "x-forwarded-proto": "https" }) as never;
  assert.equal(siteOrigin(r), "https://preethi-tutoring.vercel.app");
});

test("our own vercel.app preview hosts are accepted", () => {
  const r = req({ "x-forwarded-host": "preethi-tutoring-git-main.vercel.app" }) as never;
  assert.equal(siteOrigin(r), "https://preethi-tutoring-git-main.vercel.app");
});

test("the custom domain and its subdomains are accepted", () => {
  process.env.CUSTOM_DOMAIN = "preethi.co.uk";
  assert.equal(siteOrigin(req({ host: "www.preethi.co.uk" }) as never), "https://www.preethi.co.uk");
  assert.equal(siteOrigin(req({ host: "preethi.co.uk" }) as never), "https://preethi.co.uk");
});

test("localhost keeps http for development", () => {
  assert.equal(siteOrigin(req({ host: "localhost:3000" }, "http://localhost:3000/x") as never), "http://localhost:3000");
});

test("with nothing configured an attacker host does not leak into redirects", () => {
  const r = req({ "x-forwarded-host": "evil.example.com" }) as never;
  assert.equal(siteOrigin(r), "http://localhost:3000");
});
