import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperSmartX - LinkedIn milestone posts for career updates",
  description: "Create LinkedIn-ready graphics and captions for promotions, job changes, certifications, internships, and other career milestones. Set up your profile once, then reuse it forever.",
  openGraph: {
    title: "SuperSmartX | LinkedIn milestone posts",
    description: "Set up your profile once and turn career milestones into LinkedIn-ready graphics and captions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
