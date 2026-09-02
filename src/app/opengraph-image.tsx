import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

export const alt = `${SITE.name}: online GCSE, A-level, UCAT and medical school tutoring`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cream = "#fdfbf7";
const ink = "#1c1b18";
const inkSoft = "#4b4842";
const muted = "#6f6a60";
const line = "#efe6d6";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: cream,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 600 }}>Preethi Amudhan</span>
          <span style={{ fontSize: 20, color: muted }}>Tutoring</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div style={{ fontSize: 60, lineHeight: 1.08, fontWeight: 600, letterSpacing: -1.8, display: "flex" }}>
            GCSE, A-level and medicine tutoring that makes the hard parts click.
          </div>
          <div style={{ fontSize: 24, color: inkSoft, lineHeight: 1.45, maxWidth: 860, display: "flex" }}>
            Any GCSE or A-level subject, UCAT preparation and medical school applications. Online, one-to-one, from a final-year UEA
            medical student.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${line}`, paddingTop: 24 }}>
          <div style={{ display: "flex", gap: 48 }}>
            {[
              ["A-level", "A, A, A"],
              ["UCAT", "Top 10%"],
              ["From", "£30 an hour"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 16, color: muted }}>{label}</span>
                <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>{value}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 18, color: muted }}>preethi.co.uk</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
