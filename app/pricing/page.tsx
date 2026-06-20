import { Metadata } from "next";
import Link from "next/link";
import { paymentsEnabled, paymentsProductionReady } from "@/lib/server/feature-flags";

export const metadata: Metadata = {
  title: "Pricing - SuperSmartX",
  description: "Free plan available. Pro 30-day access at Rs 199. Lifetime access at Rs 999.",
};

export default function PricingPage() {
  const isPaymentsEnabled = paymentsEnabled();
  const isPaymentsProductionReady = paymentsProductionReady();
  const plans = [
    {
      name: "Free",
      price: "Rs 0",
      period: "forever",
      description: "For occasional posts",
      color: "#555",
      features: [
        { text: "5 downloads / month", included: true },
        { text: "Saved profile autofill", included: true },
        { text: "LinkedIn + multi-platform captions", included: true },
        { text: "3 themes", included: true },
        { text: "Watermarked exports", included: true },
        { text: "No watermark", included: false },
        { text: "Pro access window", included: false },
      ],
      cta: "Get Started Free",
      ctaHref: "/create",
      highlight: false,
    },
    {
      name: "Pro",
      price: "Rs 199",
      period: "30 days",
      description: isPaymentsEnabled ? "Unlimited exports for one access window" : "Upgrade path opens after billing relaunch",
      color: "#a3e635",
      features: [
        { text: "Unlimited downloads during access window", included: true },
        { text: "Profile once, post forever workflow", included: true },
        { text: "Platform-aware captions for 12 platforms", included: true },
        { text: "All 6 themes", included: true },
        { text: "No watermark", included: true },
        { text: "Webhook-confirmed access activation", included: true },
        { text: "Priority support", included: true },
      ],
      cta: isPaymentsEnabled ? "Get Pro 30 Days" : "Contact for Pro",
      ctaHref: isPaymentsEnabled
        ? "/api/checkout?plan=pro"
        : "mailto:hello@gozero2one.com?subject=SuperSmartX%20Pro",
      highlight: true,
    },
    {
      name: "Lifetime",
      price: "Rs 999",
      period: "one time",
      description: isPaymentsEnabled ? "Permanent access" : "Available after secure checkout rebuild",
      color: "#c084fc",
      features: [
        { text: "Unlimited downloads", included: true },
        { text: "Profile once, post forever workflow", included: true },
        { text: "Platform-aware captions for 12 platforms", included: true },
        { text: "All 6 themes", included: true },
        { text: "No watermark", included: true },
        { text: "All future templates in this app", included: true },
        { text: "Lifetime access record", included: true },
      ],
      cta: isPaymentsEnabled ? "Get Lifetime Access" : "Contact for Lifetime",
      ctaHref: isPaymentsEnabled
        ? "/api/checkout?plan=lifetime"
        : "mailto:hello@gozero2one.com?subject=SuperSmartX%20Lifetime",
      highlight: false,
    },
  ];

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
          Simple pricing
        </h1>
        <p style={{ fontSize: "16px", color: "#555", margin: 0 }}>
          {isPaymentsEnabled
            ? "Start free. Upgrade securely whenever you need more exports or a clean watermark-free finish."
            : "Start free. Upgrade path stays manual until secure billing is enabled."}
        </p>
      </div>

      {!isPaymentsEnabled && (
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto 20px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#111",
            border: "1px solid #1f1f1f",
            color: "#8f8f8f",
            fontSize: "13px",
          }}
        >
          {isPaymentsProductionReady
            ? "Online checkout is disabled because ENABLE_PAYMENTS is still off."
            : "Online checkout is disabled until a public HTTPS app URL and Cashfree credentials are configured."}
        </div>
      )}

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              background: plan.highlight ? "#111" : "#0e0e0e",
              border: `1px solid ${plan.highlight ? `${plan.color}40` : "#1e1e1e"}`,
              borderRadius: "16px",
              padding: "28px 24px",
              boxShadow: plan.highlight ? `0 0 40px ${plan.color}15` : "none",
            }}
          >
            {plan.highlight && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: plan.color,
                color: "#000",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                borderRadius: "999px",
                padding: "6px 10px",
                marginBottom: "14px",
              }}>
                Recommended
              </div>
            )}
            <div style={{ fontSize: "13px", fontWeight: 700, color: plan.color, marginBottom: "8px" }}>
              {plan.name}
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-1px" }}>
              {plan.price}
            </div>
            <span style={{ fontSize: "13px", color: "#555" }}>{plan.period}</span>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "6px" }}>{plan.description}</div>

            <div style={{ marginTop: "22px", display: "grid", gap: "10px" }}>
              {plan.features.map((feature, index) => (
                <div key={`${plan.name}-${index}`} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      marginTop: "2px",
                      color: feature.included ? plan.color : "#333",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {feature.included ? "+" : "-"}
                  </div>
                  <div style={{ fontSize: "12px", color: feature.included ? "#cfcfcf" : "#5a5a5a", lineHeight: 1.5 }}>
                    {feature.text}
                  </div>
                </div>
              ))}
            </div>

            {plan.ctaHref.startsWith("/") ? (
              <Link
                href={plan.ctaHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "24px",
                  padding: "12px 14px",
                  background: plan.highlight ? plan.color : "#1a1a1a",
                  color: plan.highlight ? "#000" : "#ccc",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: `1px solid ${plan.highlight ? plan.color : "#2a2a2a"}`,
                  borderRadius: "10px",
                }}
              >
                {plan.cta}
              </Link>
            ) : (
              <a
                href={plan.ctaHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "24px",
                  padding: "12px 14px",
                  background: plan.highlight ? plan.color : "#1a1a1a",
                  color: plan.highlight ? "#000" : "#ccc",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: `1px solid ${plan.highlight ? plan.color : "#2a2a2a"}`,
                  borderRadius: "10px",
                }}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "860px", margin: "24px auto 0", fontSize: "12px", color: "#666", textAlign: "center" }}>
        {isPaymentsEnabled
          ? "Secure checkout powered by Cashfree. Pro grants a 30-day access window with server-tracked usage and webhook-confirmed activation."
          : "Secure checkout stays disabled until env + webhook setup is complete."}
      </div>
    </div>
  );
}
