import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/auth")({
  head: () => buildMeta({ title: "Sign In", description: "Errika admin sign in.", noindex: true }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, send to admin.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setMessage("Check your email for the reset link.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Errika</p>
        <h1 className="mt-2 font-heading text-2xl text-foreground">
          {mode === "signin" ? "Admin Sign In" : "Reset Password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage content, leads, and settings."
            : "Enter your email to receive a reset link."}
        </p>

        <form onSubmit={mode === "signin" ? handleSignIn : handleForgot} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {mode === "signin" ? (
            <div>
              <label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "forgot" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="w-full text-xs text-muted-foreground hover:text-primary"
          >
            {mode === "signin" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accounts are administrator-created. Contact your Super Admin if you need access.
        </p>
      </div>
    </div>
  );
}
