import { redirect } from "next/navigation";
import CashfreeCheckout from "@/components/payment/CashfreeCheckout";

export default async function PaymentCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    order_id?: string;
    payment_session_id?: string;
    plan?: string;
  }>;
}) {
  const params = await searchParams;

  if (!params.payment_session_id || !params.order_id || !params.plan) {
    redirect("/pricing?error=missing_checkout_session");
  }

  return (
    <CashfreeCheckout
      mode={params.mode === "production" ? "production" : "sandbox"}
      orderId={params.order_id}
      paymentSessionId={params.payment_session_id}
      plan={params.plan}
    />
  );
}
