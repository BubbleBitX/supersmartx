// Uncomment and install @clerk/nextjs to enable auth
// import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderRadius: "16px", padding: "40px 36px",
        textAlign: "center", maxWidth: "360px", width: "100%",
      }}>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#f5f5f5", marginBottom: "8px" }}>Sign In</div>
        <div style={{ fontSize: "13px", color: "#555", marginBottom: "28px" }}>
          Sign in to save your generations and access Pro features
        </div>
        {/* Clerk SignIn component goes here once @clerk/nextjs is installed */}
        {/* <SignIn /> */}
        <div style={{
          padding: "14px", background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: "10px", fontSize: "12px", color: "#555", marginBottom: "16px",
        }}>
          🔐 Add your Clerk keys to <code style={{ color: "#a3e635" }}>.env.local</code><br />
          then uncomment the SignIn component above
        </div>
        <Link href="/" style={{
          display: "block", padding: "12px",
          background: "#a3e635", color: "#000",
          fontSize: "13px", fontWeight: 700,
          borderRadius: "8px", textDecoration: "none",
        }}>
          Continue without signing in →
        </Link>
      </div>
    </div>
  );
}
