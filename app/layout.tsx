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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:ital,wght@1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
