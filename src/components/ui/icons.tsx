import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Icon = {
  Check: (p: P) => (
    <svg {...base} {...p}>
      <path d="M5 12.5l4.2 4L19 7" />
    </svg>
  ),
  Arrow: (p: P) => (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Calendar: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  Video: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="6" width="13" height="12" rx="3" />
      <path d="M16 10l5-3v10l-5-3z" />
    </svg>
  ),
  Card: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  ),
  Shield: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Star: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8 6.7 19.6l1.1-5.8L3.5 9.7l5.9-.8z" />
    </svg>
  ),
  Cap: (p: P) => (
    <svg {...base} {...p}>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M21.5 9.5v5" />
    </svg>
  ),
  Heart: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
    </svg>
  ),
  Mail: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  ),
  Clock: (p: P) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Sparkle: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  ),
};
