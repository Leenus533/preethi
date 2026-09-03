/**
 * Minimal Resend client: one POST per email over plain fetch, no SDK.
 *
 * Email is a courtesy on top of the calendar, never the record of a booking, so
 * callers treat failures as non-fatal. Every send carries an idempotency key so a
 * retried Stripe webhook cannot produce a second copy.
 */
import { SITE } from "./config";

const API = "https://api.resend.com/emails";
const DEFAULT_FROM_MAILBOX = "bookings@preethi.co.uk";
/** Per-attempt limit so a hung connection cannot stall a webhook or checkout request. */
const TIMEOUT_MS = 8_000;

/** Subjects are text, but user-typed names feed them: strip control characters so no CR/LF ever reaches a header. */
export function cleanSubject(subject: string): string {
  return subject.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 998);
}

export class EmailError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "EmailError";
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Display-name form, e.g. `Preethi Amudhan Tutoring <bookings@preethi.co.uk>`. Must be on the verified domain. */
export function emailFrom(): string {
  return process.env.EMAIL_FROM || `${SITE.name} <${DEFAULT_FROM_MAILBOX}>`;
}

/** Where booking notifications for Preethi go. Defaults to the public contact address. */
export function notifyAddress(): string {
  return process.env.NOTIFY_EMAIL || SITE.contactEmail;
}

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** `<event>/<entity>`; Resend de-duplicates the same key + payload for 24 hours. */
  idempotencyKey: string;
  /** Free-form labels shown in the Resend dashboard. ASCII letters, digits, `_` and `-` only. */
  tags?: Record<string, string>;
};

export type SendResult = { id: string; deduplicated: boolean };

/**
 * Send one email. Resolves with the Resend id. On a retry with the same key Resend
 * replays the original response (same id, no second email); if the payload differs
 * it answers 409, reported here as `deduplicated: true`. Throws EmailError on
 * anything else, after one retry for rate limits and server errors.
 */
export async function sendEmail(msg: OutgoingEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new EmailError("RESEND_API_KEY is not set", 0);

  const body = JSON.stringify({
    from: emailFrom(),
    to: [msg.to],
    subject: cleanSubject(msg.subject),
    html: msg.html,
    text: msg.text,
    ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    ...(msg.tags ? { tags: Object.entries(msg.tags).map(([name, value]) => ({ name, value: value.replace(/[^A-Za-z0-9_-]/g, "_") })) } : {}),
  });

  let lastError: EmailError | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 750));
    let res: Response;
    try {
      res = await fetch(API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": msg.idempotencyKey.slice(0, 256),
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      // Network failure or timeout: retryable, and safe to retry thanks to the idempotency key.
      lastError = new EmailError(`Resend unreachable: ${e instanceof Error ? e.message : String(e)}`, 0);
      continue;
    }
    const text = await res.text();
    let json: { id?: string; message?: string; name?: string } = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      /* non-JSON error page */
    }
    if (res.ok && json.id) return { id: json.id, deduplicated: false };
    // Same key sent again with a different payload (for example the Meet link has since appeared): the first copy already went out.
    if (res.status === 409) return { id: json.id ?? "", deduplicated: true };
    lastError = new EmailError(`Resend ${res.status}: ${json.message ?? res.statusText}`, res.status, json);
    if (res.status !== 429 && res.status < 500) break;
  }
  throw lastError ?? new EmailError("Resend: unknown failure", 0);
}
