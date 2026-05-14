import { ImageResponse } from "next/og";

export const alt = "TranscribeX — Free AI Transcription Tools for Audio & Video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            TX
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            TranscribeX
          </div>
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            maxWidth: 980,
          }}
        >
          Free AI Transcription for Audio &amp; Video
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 30,
            fontWeight: 500,
            marginTop: 28,
            maxWidth: 980,
            lineHeight: 1.3,
          }}
        >
          99.8% accuracy · 50+ languages · SRT export · No signup
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 44,
          }}
        >
          {["MP3", "MP4", "WAV", "M4A", "FLAC", "YouTube"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
