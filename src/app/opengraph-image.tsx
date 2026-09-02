import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

export const alt = `${SITE.name}: online GCSE, A-level, UCAT and medical school tutoring`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const cream = "#fdfbf7";
const pine900 = "#143330";
const pine700 = "#1e534b";
const pine300 = "#7bbbad";
const clay = "#c96f31";
const ink = "#4b4842";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: cream,
          backgroundImage: `linear-gradient(135deg, #eef6f4 0%, ${cream} 45%, #f8f3ea 100%)`,
          color: pine900,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px 60px", width: 800 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `linear-gradient(135deg, #23665b, #1a423c)`,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              P
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: pine900 }}>Preethi Amudhan</span>
              <span style={{ fontSize: 16, color: "#6f6a60", letterSpacing: 1 }}>TUTORING</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 50, lineHeight: 1.08, fontWeight: 700, letterSpacing: -1.2, display: "flex" }}>
              GCSE, A-level and medicine tutoring that makes the hard parts click.
            </div>
            <div style={{ fontSize: 22, color: ink, lineHeight: 1.4 }}>
              Any GCSE or A-level subject, UCAT preparation and medical school applications. Online, one-to-one, from a final-year UEA
              medical student.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {["A, A, A at A-level", "Top 10% UCAT", "From £30 an hour", "Free intro call"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  padding: "9px 16px",
                  borderRadius: 999,
                  background: "white",
                  border: "1px solid #e2d5bd",
                  color: pine700,
                  fontSize: 17,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right-hand study motifs. */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 420, height: 630, display: "flex" }}>
          <svg width="420" height="630" viewBox="0 0 420 630" fill="none">
            <path d="M60 560 Q210 -40 380 560" stroke={pine300} strokeWidth="5" strokeLinecap="round" />
            <path d="M60 560H400M60 80V560" stroke={pine700} strokeWidth="2.5" />
            <circle cx="219" cy="262" r="10" fill={clay} />
            <g transform="translate(250 90)" stroke={pine700} strokeWidth="5" strokeLinejoin="round">
              <path d="M60 4 108.5 32v56L60 116 11.5 88V32z" />
              <circle cx="60" cy="60" r="30" strokeWidth="4" />
            </g>
            <g transform="translate(78 300)" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M20 0C20 50 80 50 80 100 80 150 20 150 20 200" stroke={pine700} />
              <path d="M80 0C80 50 20 50 20 100 20 150 80 150 80 200" stroke={clay} />
              <path d="M22 13.6h56M26 24.8h48M37 38.4h26M37 61.6h26M26 75.2h48M22 86.4h56M22 113.6h56M26 124.8h48M37 138.4h26M37 161.6h26M26 175.2h48M22 186.4h56" stroke={pine300} strokeWidth="3" />
            </g>
          </svg>
        </div>

        <div style={{ position: "absolute", left: 72, bottom: 24, fontSize: 17, color: "#6f6a60", display: "flex" }}>preethi.co.uk</div>
      </div>
    ),
    { ...size },
  );
}
