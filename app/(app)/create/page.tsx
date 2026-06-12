"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CreateFlow = dynamic(() => import("@/components/create/CreateFlow"), { ssr: false });

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#555" }}>
        Loading...
      </div>
    }>
      <CreateFlow />
    </Suspense>
  );
}
