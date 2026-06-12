import Link from "next/link";

const STATS = [
  { label: "Templates", value: "10+" },
  { label: "Design Variations", value: "2700+" },
  { label: "Creation Time", value: "60 sec" },
  { label: "Exports", value: "Unlimited" },
];

export default function RootPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5" }}>
      <section style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 24px 72px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "64px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#f5f5f5", fontSize: "18px", fontWeight: 800 }}>
            SuperSmartX
          </Link>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/templates" style={{ color: "#888", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
              Templates
            </Link>
            <Link href="/pricing" style={{ color: "#888", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
              Pricing
            </Link>
            <Link href="/dashboard" style={{
              padding: "10px 14px",
              background: "#151515",
              border: "1px solid #262626",
              color: "#f5f5f5",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}>
              Dashboard
            </Link>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "32px", alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex",
              padding: "6px 10px",
              background: "#121212",
              border: "1px solid #222",
              borderRadius: "999px",
              color: "#a3e635",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.6px",
              marginBottom: "18px",
            }}>
              Turn achievements into branded assets
            </div>
            <h1 style={{ fontSize: "56px", lineHeight: 1.02, letterSpacing: "-2px", margin: "0 0 16px", fontWeight: 800 }}>
              Create professional achievement posts in 60 seconds
            </h1>
            <p style={{ fontSize: "17px", lineHeight: 1.7, color: "#8a8a8a", margin: "0 0 28px", maxWidth: "640px" }}>
              Generate polished graphics, platform-ready captions, and personal branding content from one fast workflow.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
              <Link href="/create" style={{
                padding: "14px 20px",
                background: "linear-gradient(135deg, #a3e635, #84cc16)",
                color: "#000",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 800,
              }}>
                Start Creating Free
              </Link>
              <Link href="/templates" style={{
                padding: "14px 20px",
                background: "#131313",
                border: "1px solid #262626",
                color: "#f5f5f5",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 700,
              }}>
                View Templates
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
              {STATS.map((stat) => (
                <div key={stat.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "linear-gradient(180deg, #141414, #0d0d0d)",
            border: "1px solid #1f1f1f",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#666", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Live Preview
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>
                  Hackathon Selected
                </div>
              </div>
              <div style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "#18210c",
                border: "1px solid #2b3e10",
                color: "#a3e635",
                fontSize: "11px",
                fontWeight: 700,
              }}>
                LinkedIn Ready
              </div>
            </div>
            <div style={{
              borderRadius: "20px",
              background: "radial-gradient(circle at top, rgba(163,230,53,0.16), transparent 38%), #090909",
              border: "1px solid #202020",
              padding: "28px",
              marginBottom: "18px",
            }}>
              <div style={{ fontSize: "12px", color: "#91c83d", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
                Achievement
              </div>
              <div style={{ fontSize: "28px", lineHeight: 1.1, fontWeight: 800, marginBottom: "16px" }}>
                Selected for OpenAI x Outskill AI Builders Hackathon
              </div>
              <div style={{ fontSize: "14px", color: "#7d7d7d", lineHeight: 1.7, marginBottom: "22px" }}>
                Building an AI researcher for startups with platform-ready captions and exportable social graphics.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#1e1e1e", border: "1px solid #2a2a2a" }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>Your Name</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Software Engineer</div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ background: "#101010", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>Output</div>
                <div style={{ fontSize: "13px", color: "#d9d9d9" }}>1080x1080 PNG, LinkedIn caption, multi-platform copy</div>
              </div>
              <div style={{ background: "#101010", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>Flow</div>
                <div style={{ fontSize: "13px", color: "#d9d9d9" }}>Choose event type, fill details, customize theme, export instantly</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
