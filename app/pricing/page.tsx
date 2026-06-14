import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - SuperSmartX",
  description: "Free plan available. Pro at Rs 199/month. Lifetime access at Rs 999.",
};

const PLANS = [
  {
    name: "Free",
    price: "Rs 0",
    period: "forever",
    description: "For your next career milestone post",
    color: "#555",
    features: [
      { text: "5 downloads / month", included: true },
      { text: "Saved profile autofill", included: true },
      { text: "LinkedIn + multi-platform captions", included: true },
      { text: "3 themes", included: true },
      { text: "Watermarked exports", included: true },
      { text: "All 6 themes", included: false },
      { text: "No watermark", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/create",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Rs 199",
    period: "per month",
    description: "For professionals who share milestones regularly",
    color: "#a3e635",
    features: [
      { text: "Unlimited downloads", included: true },
      { text: "Profile once, post forever workflow", included: true },
      { text: "Platform-aware captions for 12 platforms", included: true },
      { text: "All 6 themes", included: true },
      { text: "No watermark", included: true },
      { text: "All output formats", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Pro",
    ctaHref: "/api/checkout?plan=pro",
    highlight: true,
  },
  {
    name: "Lifetime",
    price: "Rs 999",
    period: "one time",
    description: "Own your milestone posting workflow forever",
    color: "#c084fc",
    features: [
      { text: "Unlimited downloads", included: true },
      { text: "Profile once, post forever workflow", included: true },
      { text: "Platform-aware captions for 12 platforms", included: true },
      { text: "All 6 themes", included: true },
      { text: "No watermark", included: true },
      { text: "All output formats", included: true },
      { text: "All future templates", included: true },
    ],
    cta: "Get Lifetime Access",
    ctaHref: "/api/checkout?plan=lifetime",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "40px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto 48px", textAlign: "center" }}>
        <Link
          href="/"
          style={{
            fontSize: "13px",
            color: "#555",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "24px",
          }}
        >
          {"<-"} Back to Home
        </Link>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "#f5f5f5",
            margin: "0 0 10px",
            letterSpacing: "-1px",
          }}
        >
          Pricing for people who post career wins often
        </h1>
        <p style={{ fontSize: "16px", color: "#555", margin: 0 }}>
          Start free, then upgrade for unlimited exports, more themes, and watermark-free posts.
        </p>
      </div>

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            style={{
              background: plan.highlight ? "#111" : "#0e0e0e",
              border: `1px solid ${plan.highlight ? `${plan.color}40` : "#1e1e1e"}`,
              borderRadius: "16px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: plan.highlight ? `0 0 40px ${plan.color}15` : "none",
            }}
          >
            {plan.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: plan.color,
                  color: "#000",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  padding: "4px 14px",
                  borderRadius: "20px",
                }}
              >
                MOST POPULAR
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: plan.color,
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                }}
              >
                {plan.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-1px" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: "13px", color: "#555" }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "6px" }}>{plan.description}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px", flex: 1 }}>
              {plan.features.map((feature, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: feature.included ? plan.color : "#333",
                      flexShrink: 0,
                    }}
                  >
                    {feature.included ? "+" : "-"}
                  </span>
                  <span style={{ fontSize: "12px", color: feature.included ? "#ccc" : "#444" }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={plan.ctaHref}
              style={{
                display: "block",
                textAlign: "center",
                padding: "12px",
                background: plan.highlight ? plan.color : "#1a1a1a",
                color: plan.highlight ? "#000" : "#ccc",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "8px",
                textDecoration: "none",
                border: `1px solid ${plan.highlight ? plan.color : "#2a2a2a"}`,
                transition: "opacity 0.2s",
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "600px", margin: "56px auto 0", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#444", lineHeight: 1.8 }}>
          Payments powered by Cashfree | Secure checkout | Cancel anytime (Pro)
          <br />
          Questions? Reach out at <span style={{ color: "#666" }}>hello@gozero2one.com</span>
        </div>
      </div>
    </div>
  );
}
