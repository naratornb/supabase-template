"use client";

import Link from "next/link";
import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const redirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send reset email. Check your Supabase configuration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="auth-ambient absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col md:flex-row gap-8 items-start justify-center max-w-container-max w-full">
        {!isSubmitted ? (
          <div className="w-full max-w-auth-card-width bg-surface-main border border-border-subtle rounded-lg shadow-sm flex flex-col animate-fade-up">
          <div className="p-stack-md flex flex-col gap-stack-md">
            <div className="flex flex-col gap-stack-sm items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-2">
                <span
                  className="material-symbols-outlined text-on-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock_reset
                </span>
              </div>
              <h1 className="font-h2 text-h2 text-text-primary">
                Reset your password
              </h1>
              <p className="font-body-sm text-body-sm text-text-secondary">
                Enter your email address and we will send you a link to reset your
                password.
              </p>
            </div>

            <form className="flex flex-col gap-stack-md" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label
                  className="font-label-caps text-label-caps text-text-primary uppercase tracking-wider"
                  htmlFor="email-reset"
                >
                  Email address
                </label>
                <input
                  className="w-full h-10 px-3 bg-surface-main border border-border-subtle rounded-DEFAULT font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-colors placeholder:text-text-secondary/50"
                  id="email-reset"
                  placeholder="admin@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {errorMessage ? (
                <p className="font-body-sm text-body-sm text-status-error">
                  {errorMessage}
                </p>
              ) : null}
              <button
                className="w-full h-10 bg-primary text-on-primary font-body-sm text-body-sm font-medium rounded-DEFAULT hover:bg-text-primary transition-colors flex items-center justify-center gap-2"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="flex justify-center pt-2 border-t border-border-subtle mt-2">
              <Link
                className="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                href="/login"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
        ) : null}

        {isSubmitted ? (
          <div className="w-full max-w-auth-card-width bg-surface-main border border-border-subtle rounded-lg shadow-sm flex flex-col relative overflow-hidden animate-fade-up animate-stagger-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-status-active" />
            <div className="p-stack-md flex flex-col gap-stack-md items-center text-center">
              <div className="w-16 h-16 rounded-full bg-status-active/10 flex items-center justify-center mb-2">
                <span
                  className="material-symbols-outlined text-status-active text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
              <div className="flex flex-col gap-stack-sm">
                <h2 className="font-h2 text-h2 text-text-primary">
                  Check your email
                </h2>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-text-primary">{email}</span>
                  . Please check your inbox and spam folder.
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full mt-4">
                <Link
                  className="w-full h-10 bg-surface-main border border-border-subtle text-text-primary font-body-sm text-body-sm font-medium rounded-DEFAULT hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
                  href="/login"
                >
                  Back to Login
                </Link>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Didn&apos;t receive the email?{" "}
                  <button
                    className="text-text-primary font-medium hover:underline"
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Click to resend
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
