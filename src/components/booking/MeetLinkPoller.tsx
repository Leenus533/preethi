"use client";

import { useEffect, useState } from "react";

type Status = { confirmed: boolean | null; meetLink: string | null };

/** Polls the booking status until the calendar event (and Meet link) exists. */
export function MeetLinkPoller({ bookingRef, initialMeetLink, email, contactEmail }: { bookingRef: string; initialMeetLink?: string | null; email?: string; contactEmail: string }) {
  const [status, setStatus] = useState<Status>({ confirmed: initialMeetLink ? true : null, meetLink: initialMeetLink ?? null });
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (status.meetLink) return;
    let attempts = 0;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      attempts++;
      try {
        const res = await fetch(`/api/booking/${bookingRef}`, { cache: "no-store" });
        const data = (await res.json()) as Status;
        if (data.confirmed === null) {
          stopped = true;
          return; // calendar link not configured
        }
        if (data.meetLink) {
          setStatus({ confirmed: true, meetLink: data.meetLink });
          stopped = true;
          return;
        }
        if (data.confirmed) setStatus((s) => ({ ...s, confirmed: true }));
      } catch {
        /* retry */
      }
      if (attempts >= 20) {
        setGaveUp(true);
        stopped = true;
        return;
      }
      setTimeout(tick, 3000);
    };
    void tick();
    return () => {
      stopped = true;
    };
  }, [bookingRef, status.meetLink]);

  if (status.meetLink) {
    return (
      <div className="rounded-2xl border border-pine-300 bg-pine-50 p-5">
        <p className="font-semibold text-pine-900">Your Google Meet link is ready</p>
        <a href={status.meetLink} className="btn btn-primary mt-3" target="_blank" rel="noreferrer">
          Open Google Meet<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p className="mt-3 text-sm text-ink-soft">The same link is in the calendar invitation{email ? ` sent to ${email}` : ""}. Keep it for the day of the session.</p>
      </div>
    );
  }
  return (
    <div role="status" className="rounded-2xl border border-cream-300 bg-white p-5 text-sm text-ink-soft">
      {gaveUp ? (
        <p>
          Your payment went through, but the calendar invitation has not appeared yet. It usually arrives within a few minutes
          {email ? ` at ${email}` : ""}. If nothing has arrived in an hour, email{" "}
          <a href={`mailto:${contactEmail}?subject=Booking%20${encodeURIComponent(bookingRef)}`} className="font-medium text-pine-800 underline underline-offset-4">
            {contactEmail}
          </a>{" "}
          quoting reference {bookingRef.slice(0, 12)} and Preethi will confirm the time by hand.
        </p>
      ) : (
        <p>Creating your calendar invitation{email ? ` for ${email}` : ""}…</p>
      )}
    </div>
  );
}
