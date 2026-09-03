/**
 * Sends the two emails that follow a confirmed booking: one to the student, one to Preethi.
 *
 * Best effort by design. The calendar event is the booking; if email is not configured or
 * Resend is down, the booking still stands and Google's own invitation still goes out. This
 * function never throws: a template bug or a network failure is logged and reported in the
 * outcome, so the Stripe webhook never returns 500 for a booking that is already recorded.
 * Idempotency keys are derived from the booking reference, so calling this again for the
 * same booking (a retried Stripe webhook) does not send duplicates.
 */
import type { BookingDetails, ConfirmedBooking } from "./google";
import { isEmailConfigured, notifyAddress, sendEmail, type OutgoingEmail } from "./email";
import { studentConfirmationEmail, tutorNotificationEmail } from "./email-templates";

export type NotifyOptions = {
  origin: string;
  paymentUrl?: string;
};

export type SendStatus = "sent" | "duplicate" | "failed" | "skipped";
export type NotifyOutcome = { student: SendStatus; tutor: SendStatus };

export async function notifyBookingConfirmed(b: BookingDetails, r: ConfirmedBooking, opts: NotifyOptions): Promise<NotifyOutcome> {
  try {
    if (!isEmailConfigured()) {
      console.log(`notify: email not configured; skipping messages for ${b.bookingRef}`);
      return { student: "skipped", tutor: "skipped" };
    }
    const ctx = { origin: opts.origin, meetLink: r.meetLink, calendarLink: r.htmlLink, paymentUrl: opts.paymentUrl, clash: r.clash };
    const tags = { booking: b.bookingRef, service: b.serviceId };

    // Sequential rather than parallel: Resend's default limit is two requests a second, and a free
    // checkout and a webhook can land in the same second.
    const student = b.studentEmail
      ? await attempt(`student email for ${b.bookingRef}`, () => ({
          ...studentConfirmationEmail(b, ctx),
          to: b.studentEmail,
          replyTo: notifyAddress(),
          idempotencyKey: `booking-confirmation/${b.bookingRef}`,
          tags: { ...tags, kind: "student" },
        }))
      : "skipped";
    const tutor = await attempt(`tutor email for ${b.bookingRef}`, () => ({
      ...tutorNotificationEmail(b, ctx),
      to: notifyAddress(),
      replyTo: b.studentEmail || undefined,
      idempotencyKey: `booking-notification/${b.bookingRef}`,
      tags: { ...tags, kind: "tutor" },
    }));

    console.log(`notify: ${b.bookingRef} student=${student} tutor=${tutor}`);
    return { student, tutor };
  } catch (e) {
    console.error(`notify: unexpected failure for ${b.bookingRef}`, e);
    return { student: "failed", tutor: "failed" };
  }
}

/** Build and send one message; template errors and send errors both become "failed". */
async function attempt(label: string, build: () => OutgoingEmail): Promise<SendStatus> {
  try {
    const result = await sendEmail(build());
    return result.deduplicated ? "duplicate" : "sent";
  } catch (e) {
    console.error(`notify: ${label} failed`, e);
    return "failed";
  }
}
