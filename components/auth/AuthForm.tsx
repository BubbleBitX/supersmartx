"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [oauthPending, setOAuthPending] = useState<"google" | "github" | null>(null);

  const isSignUp = mode === "sign-up";
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get("next")), [searchParams]);
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";
  const githubEnabled = process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH === "true";
  const hasOAuthProvider = googleEnabled || githubEnabled;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }

        setMessage("Account created. Check your email to confirm before signing in.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOAuthPending(provider);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          ...(provider === "google"
            ? {
                queryParams: {
                  access_type: "offline",
                  prompt: "consent",
                },
              }
            : {}),
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } finally {
      setOAuthPending(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "18px",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#f5f5f5", marginBottom: "8px" }}>
          {isSignUp ? "Create your account" : "Sign in to SuperSmartX"}
        </div>
        <div style={{ fontSize: "13px", color: "#666", marginBottom: "24px", lineHeight: 1.6 }}>
          {isSignUp
            ? "Use one account for profile, saved work, and paid upgrades."
            : "Sign in to access your profile, saved work, and production data."}
        </div>

        {hasOAuthProvider && (
          <>
            <div style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
              {googleEnabled && (
                <button
                  type="button"
                  onClick={() => void handleOAuth("google")}
                  disabled={pending || !!oauthPending}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#fff",
                    color: "#111",
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    border: "1px solid #d9d9d9",
                    cursor: pending || !!oauthPending ? "not-allowed" : "pointer",
                  }}
                >
                  {oauthPending === "google" ? "Redirecting to Google..." : `${isSignUp ? "Continue" : "Sign in"} with Google`}
                </button>
              )}

              {githubEnabled && (
                <button
                  type="button"
                  onClick={() => void handleOAuth("github")}
                  disabled={pending || !!oauthPending}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#161616",
                    color: "#f5f5f5",
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    border: "1px solid #2a2a2a",
                    cursor: pending || !!oauthPending ? "not-allowed" : "pointer",
                  }}
                >
                  {oauthPending === "github" ? "Redirecting to GitHub..." : `${isSignUp ? "Continue" : "Sign in"} with GitHub`}
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "1px", background: "#242424" }} />
              <div style={{ fontSize: "11px", color: "#666" }}>or use email</div>
              <div style={{ flex: 1, height: "1px", background: "#242424" }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              style={inputStyle}
              placeholder="Minimum 8 characters"
            />
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}
          {message ? <div style={messageStyle}>{message}</div> : null}

          <button
            type="submit"
            disabled={pending || !!oauthPending}
            style={{
              padding: "12px 14px",
              background: pending ? "#2c3d12" : "#a3e635",
              color: pending ? "#d7ef9c" : "#000",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "10px",
              border: "none",
              cursor: pending || !!oauthPending ? "not-allowed" : "pointer",
            }}
          >
            {pending ? "Working..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <Link href={isSignUp ? `/sign-in?next=${encodeURIComponent(nextPath)}` : `/sign-up?next=${encodeURIComponent(nextPath)}`} style={{ color: "#a3e635", textDecoration: "none" }}>
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  background: "#161616",
  border: "1px solid #272727",
  borderRadius: "10px",
  color: "#f5f5f5",
  fontSize: "13px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  color: "#7f7f7f",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  background: "rgba(220, 38, 38, 0.12)",
  border: "1px solid rgba(248, 113, 113, 0.28)",
  color: "#fca5a5",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "12px",
  lineHeight: 1.5,
};

const messageStyle: React.CSSProperties = {
  background: "rgba(163, 230, 53, 0.08)",
  border: "1px solid rgba(163, 230, 53, 0.2)",
  color: "#d9f99d",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "12px",
  lineHeight: 1.5,
};

