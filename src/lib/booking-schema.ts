/** Validation for the booking form, shared by the API route and the client. */

export type BookingInput = {
  serviceId: string;
  start: string; // ISO instant
  name: string;
  email: string;
  parentName?: string;
  yearGroup?: string;
  notes?: string;
  website?: string; // honeypot, must be empty
};

export type ValidationResult = { ok: true; value: BookingInput } | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Stripe metadata values are capped at 500 characters, and notes travel through metadata for paid bookings. */
export const NOTES_MAX = 450;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateBookingInput(raw: unknown): ValidationResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const serviceId = str(r.serviceId, 64);
  const start = str(r.start, 40);
  const name = str(r.name, 120);
  const email = str(r.email, 200).toLowerCase();
  const parentName = str(r.parentName, 120);
  const yearGroup = str(r.yearGroup, 80);
  const notes = str(r.notes, NOTES_MAX);
  const website = str(r.website, 200);

  if (!serviceId) errors.serviceId = "Choose a session type.";
  if (!start || Number.isNaN(Date.parse(start))) errors.start = "Choose a date and time.";
  if (name.length < 2) errors.name = "Please enter the student's name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (website) errors.website = "Spam check failed.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { serviceId, start: new Date(start).toISOString(), name, email, parentName, yearGroup, notes, website },
  };
}
