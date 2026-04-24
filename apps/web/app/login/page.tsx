"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace("/users");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Check your Supabase configuration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="auth-ambient absolute inset-0" aria-hidden="true" />
      <main className="relative w-full max-w-[400px] bg-surface-main border border-border-subtle rounded-xl p-8 shadow-sm flex flex-col gap-6 animate-fade-up">
        <header className="flex flex-col gap-2 text-center items-center mb-2 animate-fade-up">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-2">
            <span
              className="material-symbols-outlined text-on-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              admin_panel_settings
            </span>
          </div>
          <h1 className="font-h2 text-h2 text-text-primary tracking-tight">
            Welcome back
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Sign in to continue to Supabase Admin.
          </p>
        </header>

        {errorMessage ? (
          <div className="bg-error-container border border-status-error/30 rounded-md p-3 flex items-start gap-3 animate-fade-up animate-stagger-1">
            <span className="material-symbols-outlined text-status-error text-[20px] mt-0.5">
              error
            </span>
            <div className="flex-1">
              <p className="font-table-data text-table-data text-on-error-container">
                Authentication failed
              </p>
              <p className="font-body-sm text-body-sm text-on-error-container/80 mt-0.5">
                {errorMessage}
              </p>
            </div>
          </div>
        ) : null}

        <form
          className="flex flex-col gap-5 animate-fade-up animate-stagger-2"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label
              className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              className="w-full px-3 py-2 bg-surface-main border border-border-subtle rounded-md font-body-base text-body-base text-text-primary placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
              id="email"
              name="email"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider"
                htmlFor="password"
              >
                Password
              </label>
              <Link
                className="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <input
              className="w-full px-3 py-2 bg-surface-main border border-status-error rounded-md font-body-base text-body-base text-text-primary focus:outline-none focus:ring-1 focus:ring-status-error focus:border-status-error transition-shadow"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {errorMessage ? (
              <p className="font-body-sm text-body-sm text-status-error mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  warning
                </span>
                {errorMessage}
              </p>
            ) : null}
          </div>

          <button
            className="w-full bg-primary text-on-primary font-table-data text-table-data rounded-md py-2.5 mt-2 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-main"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="text-center mt-2 border-t border-border-subtle pt-6">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              className="font-table-data text-table-data text-text-primary hover:underline underline-offset-2"
              href="/register"
            >
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
