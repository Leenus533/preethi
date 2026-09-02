import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #23665b, #143330)",
          color: "#fdfbf7",
          fontSize: 108,
          fontWeight: 700,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none" style={{ position: "absolute", inset: 0 }}>
          <path d="M32 9 51.9 20.5v23L32 55 12.1 43.5v-23z" stroke="#7bbbad" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
        </svg>
        <span style={{ display: "flex", marginTop: -6 }}>P</span>
      </div>
    ),
    { ...size },
  );
}
