/**
 * Booking emails as hand-written HTML + plain text.
 *
 * Email clients ignore most modern CSS, so these use a single-column table with
 * inline styles, the site's own palette, and no images. Everything the student or
 * Preethi typed goes through escapeHtml before it is placed in markup.
 */
import { SITE, TIMEZONE } from "./config";
import { escapeHtml } from "./google";
import type { BookingDetails } from "./google";
import { formatDate, formatTime, tzAbbreviation } from "./time";

export type RenderedEmail = { subject: string; html: string; text: string };

export type BookingEmailContext = {
  /** Public origin of the site, e.g. https://preethi.co.uk (no trailing slash). */
  origin: string;
  meetLink?: string;
  /** Link to the event in Google Calendar (for Preethi). */
  calendarLink?: string;
  /** Link to the payment in the Stripe dashboard (for Preethi). */
  paymentUrl?: string;
  clash?: boolean;
};

/* ---------- Palette (mirrors globals.css) ---------- */
const C = {
  ground: "#fdfbf7", // cream-50
  card: "#ffffff",
  line: "#e2d5bd", // cream-300
  ink: "#1c1b18",
  inkSoft: "#4b4842",
  muted: "#6f6a60",
  pine: "#1a423c", // pine-800
  pineButton: "#23665b", // pine-600
  pineTint: "#eef6f4", // pine-50
  clayTint: "#fdebdd", // clay-100
  clay: "#a2561f", // clay-700
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ---------- Formatting helpers ---------- */

function firstName(full: string): string {
  const first = full.trim().split(/\s+/)[0];
  // "Student" is the webhook's placeholder when Stripe supplied no name.
  return !first || first === "Student" ? "there" : first;
}

function pounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

/** "Thu 10 Sep, 18:00" for subject lines. */
export function formatShortDateTime(ts: Date, tz = TIMEZONE): string {
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(ts);
  return `${date}, ${formatTime(ts, tz)}`;
}

function whenLines(b: BookingDetails) {
  const tz = tzAbbreviation(b.start, TIMEZONE);
  return {
    date: formatDate(b.start, TIMEZONE),
    time: `${formatTime(b.start, TIMEZONE)} to ${formatTime(b.end, TIMEZONE)} ${tz}`,
    length: `${minutesBetween(b.start, b.end)} minutes`,
  };
}

function paymentLine(b: BookingDetails): string {
  // "No charge" rather than "Free": the latter is a classic promotion-filter trigger in email.
  return b.pricePence > 0 ? `${pounds(b.pricePence)} paid` : "No charge";
}

function successUrl(origin: string, ref: string): string {
  return `${origin}/book/success?ref=${encodeURIComponent(ref)}`;
}

/* ---------- HTML building blocks ---------- */

function row(label: string, valueHtml: string): string {
  return `<tr>
  <td style="padding:10px 0;border-top:1px solid ${C.line};font:14px/1.4 ${FONT};color:${C.muted};width:34%;vertical-align:top">${label}</td>
  <td style="padding:10px 0;border-top:1px solid ${C.line};font:15px/1.4 ${FONT};color:${C.ink};font-weight:600;vertical-align:top">${valueHtml}</td>
</tr>`;
}

function detailsTable(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px">${rows.map(([l, v]) => row(l, v)).join("")}</table>`;
}

function button(href: string, label: string, color = C.pineButton): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 6px"><tr><td style="border-radius:10px;background:${color}">
  <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;font:600 15px/1 ${FONT};color:#ffffff;text-decoration:none;border-radius:10px">${label}</a>
</td></tr></table>`;
}

function paragraph(html: string, opts: { muted?: boolean; small?: boolean } = {}): string {
  const size = opts.small ? "13px/1.55" : "16px/1.55";
  const color = opts.muted ? C.muted : C.inkSoft;
  return `<p style="margin:0 0 14px;font:${size} ${FONT};color:${color}">${html}</p>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font:700 26px/1.2 ${FONT};color:${C.pine};letter-spacing:-0.01em">${text}</h1>`;
}

function subheading(text: string): string {
  return `<h2 style="margin:26px 0 8px;font:700 17px/1.3 ${FONT};color:${C.pine}">${text}</h2>`;
}

function notice(html: string, tone: "pine" | "clay"): string {
  const bg = tone === "pine" ? C.pineTint : C.clayTint;
  const fg = tone === "pine" ? C.pine : C.clay;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0"><tr><td style="background:${bg};border-radius:12px;padding:14px 16px;font:15px/1.5 ${FONT};color:${fg}">${html}</td></tr></table>`;
}

function layout(opts: { preview: string; body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(opts.preview)}</title>
</head>
<body style="margin:0;padding:0;background:${C.ground}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(opts.preview)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ground}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="padding:0 4px 14px;font:700 15px/1 ${FONT};color:${C.pine}">${escapeHtml(SITE.name)}</td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:28px 28px 22px">
      ${opts.body}
    </td></tr>
    <tr><td style="padding:18px 6px 0;font:13px/1.55 ${FONT};color:${C.muted}">
      ${opts.footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/* ---------- Student confirmation ---------- */

export function studentConfirmationEmail(b: BookingDetails, ctx: BookingEmailContext): RenderedEmail {
  const e = escapeHtml;
  const isIntro = b.pricePence === 0;
  const when = whenLines(b);
  const page = successUrl(ctx.origin, b.bookingRef);
  const subject = `Booked: ${b.serviceName}, ${formatShortDateTime(b.start)}`;
  const preview = `${b.serviceName} on ${when.date} at ${formatTime(b.start, TIMEZONE)} (UK time).`;

  const meetHtml = ctx.meetLink
    ? `${subheading("Joining the session")}
${paragraph("The session is on Google Meet. Join from a laptop or tablet with a camera a couple of minutes before the start.")}
${button(ctx.meetLink, "Open Google Meet")}
${paragraph(`Or copy this link: <a href="${e(ctx.meetLink)}" style="color:${C.pine}">${e(ctx.meetLink)}</a>`, { small: true, muted: true })}`
    : `${subheading("Joining the session")}
${paragraph("The session is on Google Meet. The link is in the Google Calendar invitation that arrives separately, and on your booking page:")}
${button(page, "View booking and Meet link")}`;

  const prep = isIntro
    ? `Have a rough idea of the subjects, exam board and what you would like to get out of tutoring. If you would like bulk sessions or a regular weekly slot, say so on the call: bulk sessions are ${SITE.blockDiscountPercent}% off and tailored to what you need. Twenty minutes goes quickly.`
    : "Have your exam board, any recent papers or marked work, and the topics you want to cover to hand.";

  const body = `${heading(isIntro ? "Your intro call is booked" : "You're booked in")}
${paragraph(`Hi ${e(firstName(b.studentName))}, thanks for booking${b.parentName ? ` (and hello to ${e(firstName(b.parentName))})` : ""}. Here are the details.`)}
${detailsTable([
  ["Session", e(b.serviceName)],
  ["Date", e(when.date)],
  ["Time", e(when.time)],
  ["Length", e(when.length)],
  ["Payment", e(paymentLine(b))],
])}
${meetHtml}
${subheading("Before we start")}
${paragraph(prep)}
${subheading("Need to change the time?")}
${paragraph(`Reply to this email with at least ${SITE.cancellationNoticeHours} hours' notice and Preethi will move it, free of charge. A Google Calendar invitation is on its way too; accepting it keeps the session in your own calendar with reminders.`)}`;

  const footer = `Booking reference ${e(b.bookingRef)}<br>
${e(SITE.tutorName)} · ${e(SITE.location)} · <a href="mailto:${e(SITE.contactEmail)}" style="color:${C.muted}">${e(SITE.contactEmail)}</a>${SITE.showPhone ? ` · ${e(SITE.phone)}` : ""}<br>
You are receiving this because a session was booked at ${e(ctx.origin.replace(/^https?:\/\//, ""))} using this email address.`;

  const text = [
    isIntro ? "Your intro call is booked" : "You're booked in",
    "",
    `Hi ${firstName(b.studentName)}, thanks for booking. Here are the details.`,
    "",
    `Session:  ${b.serviceName}`,
    `Date:     ${when.date}`,
    `Time:     ${when.time}`,
    `Length:   ${when.length}`,
    `Payment:  ${paymentLine(b)}`,
    "",
    "Joining the session",
    ctx.meetLink
      ? `The session is on Google Meet. Join a couple of minutes early: ${ctx.meetLink}`
      : `The session is on Google Meet. The link is in the Google Calendar invitation that arrives separately, and on your booking page: ${page}`,
    "",
    "Before we start",
    prep,
    "",
    "Need to change the time?",
    `Reply to this email with at least ${SITE.cancellationNoticeHours} hours' notice and Preethi will move it, free of charge.`,
    "",
    `Booking reference ${b.bookingRef}`,
    `${SITE.tutorName}, ${SITE.location}. ${SITE.contactEmail}${SITE.showPhone ? `, ${SITE.phone}` : ""}`,
  ].join("\n");

  return { subject, html: layout({ preview, body, footer }), text };
}

/* ---------- Tutor notification ---------- */

export function tutorNotificationEmail(b: BookingDetails, ctx: BookingEmailContext): RenderedEmail {
  const e = escapeHtml;
  const when = whenLines(b);
  const short = formatShortDateTime(b.start);
  const subject = `${ctx.clash ? "CLASH: " : "New booking: "}${b.serviceName} with ${b.studentName}, ${short}`;
  const preview = `${b.studentName}, ${when.date} at ${formatTime(b.start, TIMEZONE)}. ${paymentLine(b)}.`;

  const paymentHtml = ctx.paymentUrl
    ? `<a href="${e(ctx.paymentUrl)}" style="color:${C.pine}">${e(paymentLine(b))}</a>`
    : e(paymentLine(b));

  // [label, html, plain text]. The text column is built from raw values, never by un-escaping HTML.
  const rows: [string, string, string][] = [
    ["Student", e(b.studentName), b.studentName],
    ["Email", `<a href="mailto:${e(b.studentEmail)}" style="color:${C.pine}">${e(b.studentEmail)}</a>`, b.studentEmail],
  ];
  if (b.parentName) rows.push(["Parent / guardian", e(b.parentName), b.parentName]);
  if (b.yearGroup) rows.push(["Year group", e(b.yearGroup), b.yearGroup]);
  rows.push(
    ["Session", e(b.serviceName), b.serviceName],
    ["When", `${e(when.date)}<br>${e(when.time)}`, `${when.date}, ${when.time}`],
    ["Length", e(when.length), when.length],
    ["Payment", paymentHtml, paymentLine(b)],
  );

  const clashHtml = ctx.clash
    ? notice(
        "<strong>This slot overlaps another event in your calendar.</strong> Payment completed after the temporary hold expired, so the booking was recorded anyway. Please contact the student to rearrange.",
        "clay",
      )
    : "";

  const notesHtml = b.notes
    ? `${subheading("Notes from the student")}
<div style="white-space:pre-wrap;padding:12px 14px;background:${C.ground};border:1px solid ${C.line};border-radius:10px;font:15px/1.5 ${FONT};color:${C.ink}">${e(b.notes)}</div>`
    : "";

  const links = [ctx.calendarLink ? button(ctx.calendarLink, "Open in Google Calendar") : "", ctx.meetLink ? button(ctx.meetLink, "Open Google Meet", C.pine) : ""]
    .filter(Boolean)
    .join("");

  const body = `${heading(ctx.clash ? "Double booking needs attention" : "New booking")}
${clashHtml}
${detailsTable(rows.map(([l, v]) => [l, v]))}
${notesHtml}
${links}
${paragraph("Reply to this email to contact the student directly.", { muted: true, small: true })}`;

  const footer = `Booking reference ${e(b.bookingRef)}${b.paymentRef ? `<br>Payment reference ${e(b.paymentRef)}` : ""}<br>
Sent by the booking site at ${e(ctx.origin.replace(/^https?:\/\//, ""))}.`;

  const textRows = rows.map(([l, , t]) => `${l}: ${t}`);
  const text = [
    ctx.clash ? "DOUBLE BOOKING NEEDS ATTENTION" : "New booking",
    "",
    ...(ctx.clash ? ["This slot overlaps another event in your calendar. Payment completed after the temporary hold expired, so the booking was recorded anyway. Please contact the student to rearrange.", ""] : []),
    ...textRows,
    ...(b.notes ? ["", "Notes from the student:", b.notes] : []),
    ...(ctx.calendarLink ? ["", `Calendar event: ${ctx.calendarLink}`] : []),
    ...(ctx.meetLink ? [`Google Meet: ${ctx.meetLink}`] : []),
    ...(ctx.paymentUrl ? [`Payment: ${ctx.paymentUrl}`] : []),
    "",
    "Reply to this email to contact the student directly.",
    "",
    `Booking reference ${b.bookingRef}`,
    ...(b.paymentRef ? [`Payment reference ${b.paymentRef}`] : []),
  ].join("\n");

  return { subject, html: layout({ preview, body, footer }), text };
}
