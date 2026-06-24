import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BreedWise — UK pet breeder directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #E6FFFB 0%, #ffffff 45%, #FFF5F0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#00BFA5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#2D3436" }}>BreedWise.co.uk</div>
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#2D3436",
            maxWidth: "900px",
          }}
        >
          Find your perfect{" "}
          <span style={{ color: "#00BFA5" }}>companion</span>
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "30px",
            lineHeight: 1.4,
            color: "#64748b",
            maxWidth: "880px",
          }}
        >
          UK pet breeder directory — dogs, cats, birds, fish and more
        </div>
      </div>
    ),
    { ...size }
  );
}
