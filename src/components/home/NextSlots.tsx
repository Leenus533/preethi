"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { serviceId: string; timezone: string; days?: number; limit?: number };
type Day = { key: string; first: string; count: number };
type State = { status: "loading" } | { status: "ready"; days: Day[]; live: boolean } | { status: "unavailable" };

function todayIn(tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}
const ymd = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The next few days with free times for one service, read live from the booking calendar.
 * Evidence that booking is real and quick, placed where a stock photo would otherwise go.
 */
export function NextSlots({ serviceId, timezone, days = 14, limit = 5 }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    const from = todayIn(timezone);
    const to = new Date(from.getTime() + days * 86_400_000);
    fetch(`/api/availability?serviceId=${encodeURIComponent(serviceId)}&from=${ymd(from)}&to=${ymd(to)}`, { signal: ctrl.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { source: "calendar" | "hours-only"; slots: Record<string, string[]> };
        const grouped = Object.entries(data.slots)
          .filter(([, times]) => times.length > 0)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .slice(0, limit)
          .map(([key, times]) => ({ key, first: [...times].sort()[0], count: times.length }));
        setState({ status: "ready", days: grouped, live: data.source === "calendar" });
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setState({ status: "unavailable" });
      });
    return () => ctrl.abort();
  }, [serviceId, timezone, days, limit]);

  const day = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "short", day: "numeric", month: "short" });
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const href = `/book?service=${serviceId}`;

  return (
    <section aria-labelledby="next-slots-title" className="panel p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="next-slots-title" className="text-[0.9375rem] font-medium text-ink">
          Next free intro calls
        </h2>
        <span className="text-[length:var(--text-meta)] text-muted">UK time</span>
      </div>

      <div className="mt-3 min-h-[13.5rem]" aria-live="polite">
        {state.status === "loading" && <p className="py-3 text-sm text-muted">Checking the calendar…</p>}

        {state.status === "ready" && state.days.length > 0 && (
          <ol className="rows">
            {state.days.map((d) => {
              const first = new Date(d.first);
              return (
                <li key={d.key}>
                  <Link href={href} className="focus-ring group grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-4 py-2.5 text-[0.9375rem]">
                    <span className="text-ink">{day.format(first)}</span>
                    <span className="text-sm text-muted">
                      from{" "}
                      <time dateTime={d.first} className="tabular-nums text-ink">
                        {time.format(first)}
                      </time>
                      {d.count > 1 && <span className="hidden sm:inline">, {d.count} times</span>}
                    </span>
                    <span className="text-sm text-pine-800 group-hover:underline underline-offset-4">Book</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        {state.status === "ready" && state.days.length === 0 && (
          <p className="py-3 text-sm text-ink-soft">Nothing free in the next {days} days. The calendar shows the next two months.</p>
        )}

        {state.status === "unavailable" && (
          <p className="py-3 text-sm text-ink-soft">Weekday evenings from 17:00 and weekends from 09:00. The calendar shows exact times.</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 border-t border-cream-200 pt-4">
        <p className="text-[length:var(--text-meta)] text-muted">
          {state.status === "ready" && state.live ? "Live from Preethi\u2019s calendar. 20 minutes, free." : "20 minutes, free, over Google Meet."}
        </p>
        <Link href={href} className="link text-sm font-medium">
          See every time
        </Link>
      </div>
    </section>
  );
}
