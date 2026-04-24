"use client";

import Link from "next/link";
import { useState } from "react";

import { supabase } from "../../lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Account created successfully. Please check your email to verify your address."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to register. Check your Supabase configuration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="auth-ambient absolute inset-0" aria-hidden="true" />
      <main className="relative w-full max-w-[400px] flex flex-col gap-stack-md animate-fade-up">
        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center mb-2">
            <span
              className="material-symbols-outlined text-on-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              database
            </span>
          </div>
          <h1 className="font-h2 text-h2 text-text-primary">
            Create an account
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Enter your details to get started with Supabase Admin.
          </p>
        </div>

        <div className="bg-surface-main border border-border-subtle rounded-xl p-8 flex flex-col gap-stack-md shadow-sm">
          {successMessage ? (
            <div className="bg-secondary-container/20 border border-secondary-container rounded-DEFAULT p-4 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-on-secondary-container mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}
              >
                check_circle
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-table-data text-table-data text-on-secondary-container">
                  Account created successfully
                </p>
                <p className="font-body-sm text-body-sm text-on-secondary-container/80">
                  {successMessage}
                </p>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="bg-error-container border border-status-error/30 rounded-DEFAULT p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-status-error mt-0.5">
                error
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-table-data text-table-data text-on-error-container">
                  Registration failed
                </p>
                <p className="font-body-sm text-body-sm text-on-error-container/80">
                  {errorMessage}
                </p>
              </div>
            </div>
          ) : null}

          <form className="flex flex-col gap-stack-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label
                className="font-label-caps text-label-caps text-text-secondary uppercase"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full bg-surface-main border border-border-subtle rounded-DEFAULT px-3 py-2 font-body-base text-body-base text-text-primary focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors placeholder:text-text-secondary/50"
                id="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-label-caps text-label-caps text-text-secondary uppercase"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full bg-surface-main border border-border-subtle rounded-DEFAULT px-3 py-2 font-body-base text-body-base text-text-primary focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors placeholder:text-text-secondary/50"
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-label-caps text-label-caps text-text-secondary uppercase"
                htmlFor="confirm_password"
              >
                Confirm Password
              </label>
              <input
                className="w-full bg-surface-main border border-border-subtle rounded-DEFAULT px-3 py-2 font-body-base text-body-base text-text-primary focus:outline-none focus:border-outline focus:ring-1 focus:ring-outline transition-colors placeholder:text-text-secondary/50"
                id="confirm_password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button
              className="w-full bg-primary text-on-primary font-table-data text-table-data rounded-DEFAULT py-2.5 mt-2 hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <div className="flex justify-center mt-2">
          <Link
            className="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
            href="/login"
          >
            Already have an account? <span className="font-medium text-primary">Log in</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
