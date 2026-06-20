import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      sent: false,
      error: "Transactional email is disabled until a protected server-side flow is implemented.",
    },
    { status: 503 },
  );
}
