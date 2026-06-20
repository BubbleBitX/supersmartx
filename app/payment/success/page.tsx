import Link from "next/link";
import type { Metadata } from "next";
import PaymentSuccessStatus from "@/components/payment/PaymentSuccessStatus";

export const metadata: Metadata = { title: "Payment Successful - SuperSmartX" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; order_id?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan ?? "pro";
  const orderId = params.order_id;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderRadius: "20px", padding: "48px 40px",
        textAlign: "center", maxWidth: "440px", width: "100%",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>Success</div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f5f5f5", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Payment successful
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px" }}>
          {plan === "lifetime"
            ? <>You now have <strong style={{ color: "#a3e635" }}>Lifetime</strong> access to SuperSmartX.</>
            : <>You now have <strong style={{ color: "#a3e635" }}>Pro 30-day</strong> access to SuperSmartX.</>}
        </p>
        {orderId && (
          <p style={{ fontSize: "11px", color: "#444", margin: "0 0 20px" }}>
            Order ID: {orderId}
          </p>
        )}
        {orderId ? <PaymentSuccessStatus orderId={orderId} /> : null}
        <Link href="/create" style={{
          display: "block", padding: "13px",
          background: "linear-gradient(135deg, #a3e635, #84cc16)",
          color: "#000", fontSize: "14px", fontWeight: 700,
          borderRadius: "10px", textDecoration: "none",
        }}>
          Start creating
        </Link>
      </div>
    </div>
  );
}
