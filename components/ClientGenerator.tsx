"use client";
import dynamic from "next/dynamic";

const GeneratorForm = dynamic(() => import("./GeneratorForm"), { ssr: false });

export default function ClientGenerator({ initialTemplateId }: { initialTemplateId?: string }) {
  return <GeneratorForm initialTemplateId={initialTemplateId} />;
}
