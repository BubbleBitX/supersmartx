"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: "_self" | "_blank" }) => Promise<unknown>;
    };
  }
}

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

type CashfreeFactory = NonNullable<Window['Cashfree']>;

function loadCashfreeSdk(): Promise<CashfreeFactory> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree SDK can only load in the browser."));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  return new Promise<CashfreeFactory>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${CASHFREE_SDK_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Cashfree SDK did not initialize.")));
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK.")));
      return;
    }

    const script = document.createElement("script");
    script.src = CASHFREE_SDK_URL;
    script.async = true;
    script.onload = () => window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Cashfree SDK did not initialize."));
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK."));
    document.body.appendChild(script);
  });
}

export default function CashfreeCheckout({
  mode,
  orderId,
  paymentSessionId,
  plan,
}: {
  mode: "sandbox" | "production";
  orderId: string;
  paymentSessionId: string;
  plan: string;
}) {
  const [state, setState] = useState<"booting" | "launching" | "error">("booting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const planLabel = useMemo(() => (plan === "lifetime" ? "Lifetime" : "Pro"), [plan]);

  useEffect(() => {
    let cancelled = false;

    const launchCheckout = async () => {
      try {
        const cashfreeFactory = await loadCashfreeSdk();
        if (!cashfreeFactory) {
          throw new Error("Cashfree SDK did not initialize.");
        }

        if (cancelled) {
          return;
        }

        setState("launching");
        const cashfree = cashfreeFactory({ mode });
        await cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState("error");
        setErrorMessage(error instanceof Error ? error.message : "Unable to start checkout.");
      }
    };

    void launchCheckout();
    return () => {
      cancelled = true;
    };
  }, [mode, paymentSessionId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090909",
        color: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "24px",
          padding: "36px 30px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6f6f6f", marginBottom: "14px" }}>
          Secure checkout
        </div>
        <h1 style={{ fontSize: "28px", lineHeight: 1.1, margin: "0 0 10px", fontWeight: 800 }}>
          {state === "error" ? "Checkout could not start" : `Opening ${planLabel} checkout`}
        </h1>
        <p style={{ fontSize: "14px", color: "#8b8b8b", lineHeight: 1.7, margin: "0 0 22px" }}>
          {state === "error"
            ? "The payment session was created, but the hosted checkout did not launch from this browser session."
            : "Please wait while Cashfree launches the hosted payment flow."}
        </p>

        <div style={{ background: "#0d0d0d", border: "1px solid #1b1b1b", borderRadius: "14px", padding: "14px 16px", marginBottom: "22px", textAlign: "left" }}>
          <div style={{ fontSize: "11px", color: "#6d6d6d", marginBottom: "6px" }}>Order ID</div>
          <div style={{ fontSize: "13px", color: "#e7e7e7", wordBreak: "break-all" }}>{orderId}</div>
        </div>

        {state === "error" && (
          <div style={{ background: "#1a1010", border: "1px solid #3a1d1d", color: "#f5b7b7", borderRadius: "12px", padding: "12px 14px", fontSize: "12px", lineHeight: 1.6, marginBottom: "18px" }}>
            {errorMessage || "Unable to start checkout."}
          </div>
        )}

        {state !== "error" && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "#a3e635", fontSize: "13px", fontWeight: 700 }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                border: "2px solid rgba(163,230,53,0.28)",
                borderTopColor: "#a3e635",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Redirecting to Cashfree
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          <Link href="/pricing" style={{ color: "#7f7f7f", fontSize: "12px", textDecoration: "none" }}>
            Back to pricing
          </Link>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}


