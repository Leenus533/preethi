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
  Chevron: (p: P) => (
    <svg {...base} {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Calendar: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  Shield: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Clock: (p: P) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Video: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M16 10l5-3v10l-5-3" />
    </svg>
  ),
  Phone: (p: P) => (
    <svg {...base} {...p}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  Mail: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  ),
  Pin: (p: P) => (
    <svg {...base} {...p}>
      <path d="M12 21s6-5.4 6-11a6 6 0 10-12 0c0 5.6 6 11 6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  ),
  Cap: (p: P) => (
    <svg {...base} {...p}>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M21.5 9.5V15" />
    </svg>
  ),
  Card: (p: P) => (
    <svg {...base} {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10.5h18M7 14.5h4" />
    </svg>
  ),
  Users: (p: P) => (
    <svg {...base} {...p}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15.5 5.6a3.2 3.2 0 010 5.8M17 13.7c2.4.6 4 2.5 4 5.3" />
    </svg>
  ),

  /* Subject motifs. */
  Graph: (p: P) => (
    <svg {...base} {...p}>
      <path d="M4 4v16h16" />
      <path d="M7 15c2.5-7 5.5-7 8 0 .8 2.2 1.6 2.6 3 1" />
      <circle cx="11.5" cy="9.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  Helix: (p: P) => (
    <svg {...base} {...p}>
      <path d="M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9" />
      <path d="M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9" />
      <path d="M9.2 6h5.6M9.2 18h5.6M8.4 12h7.2" strokeWidth="1.4" />
    </svg>
  ),
  Stethoscope: (p: P) => (
    <svg {...base} {...p}>
      <path d="M6 3v6a5 5 0 0010 0V3" />
      <path d="M11 14v2.5a4 4 0 008 0V14" />
      <circle cx="19" cy="11.5" r="2" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;
