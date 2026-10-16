"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth, AuthMode } from "@/context/auth-context";

export function AuthModal() {
  const { isAuthModalOpen, authModalDefaultMode } = useAuth();
  if (!isAuthModalOpen) return null;

  return <AuthModalContent key={authModalDefaultMode} />;
}

function AuthModalContent() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalReason,
    authModalRedirect,
    authModalDefaultMode,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [authMode, setAuthMode] = React.useState<AuthMode>(authModalDefaultMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isAuthModalOpen) closeAuthModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const clearFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePostAuthSuccess = () => {
    if (authModalRedirect) router.push(authModalRedirect);
  };

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setIsLoading(true);

    const result = await signInWithEmail(email, password);
    setIsLoading(false);

    if (result.error) setErrorMessage(result.error);
    else handlePostAuthSuccess();
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.confirmationRequired) {
      setSuccessMessage(`Check ${email.trim()} for a confirmation link, then log in.`);
    } else {
      handlePostAuthSuccess();
    }
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    clearFeedback();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0E0A07]/85 p-3 font-sans backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[rgba(212,163,89,0.3)] bg-[rgba(34,24,16,0.95)] shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#C69344] via-[#E5C178] to-[#C69344]" />

        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-[#B8A692] transition-colors hover:bg-[#221810] hover:text-[#FAF4EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C178]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="mb-5 text-center">
            <div className="mb-2.5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(212,163,89,0.3)] bg-[#16100B] text-[#E5C178]">
              {authMode === "signup" ? <UserPlus className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <h2 id="auth-modal-title" className="font-serif text-xl font-normal tracking-tight text-[#FAF4EB] sm:text-2xl">
              {authMode === "signup" ? "Create Your Account" : "Log In to Your Account"}
            </h2>
            <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-[#B8A692]">
              {authMode === "signup"
                ? "Create an account to manage your bookings and guest details."
                : "Welcome back. Log in to view your bookings."}
            </p>
          </div>

          {authModalReason && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[rgba(212,163,89,0.3)] bg-[#E5C178]/10 p-3 text-sm text-[#FAF4EB]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C178]" />
              <div>
                <span className="block font-semibold text-[#E5C178]">Reservation requirement</span>
                <span className="mt-0.5 block text-[#B8A692]">{authModalReason}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div role="alert" aria-live="assertive" className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B] p-1 text-sm font-semibold">
            <button
              type="button"
              aria-pressed={authMode === "login"}
              onClick={() => switchMode("login")}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C178] ${authMode === "login" ? "bg-[#E5C178] text-[#140E08]" : "text-[#B8A692] hover:text-[#FAF4EB]"}`}
            >
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              aria-pressed={authMode === "signup"}
              onClick={() => switchMode("signup")}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C178] ${authMode === "signup" ? "bg-[#E5C178] text-[#140E08]" : "text-[#B8A692] hover:text-[#FAF4EB]"}`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="auth-login-email" className="mb-1.5 block text-sm font-medium text-[#B8A692]">Email address</label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    id="auth-login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/90 py-3 pl-10 pr-3 text-base text-[#FAF4EB] placeholder-[#8C7E72] focus:border-[#E5C178] focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="auth-login-password" className="mb-1.5 block text-sm font-medium text-[#B8A692]">Password</label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    id="auth-login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/90 py-3 pl-10 pr-3 text-base text-[#FAF4EB] placeholder-[#8C7E72] focus:border-[#E5C178] focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] px-4 text-sm font-bold text-[#140E08] shadow-md shadow-[#E5C178]/15 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF4EB] disabled:cursor-wait disabled:opacity-50"
              >
                <span>{isLoading ? "Signing in…" : "Log In to FLATEL"}</span>
                {!isLoading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="auth-signup-name" className="mb-1.5 block text-sm font-medium text-[#B8A692]">Full name</label>
                <input
                  id="auth-signup-name"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/90 px-3 py-3 text-base text-[#FAF4EB] placeholder-[#8C7E72] focus:border-[#E5C178] focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                />
              </div>
              <div>
                <label htmlFor="auth-signup-email" className="mb-1.5 block text-sm font-medium text-[#B8A692]">Email address</label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    id="auth-signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/90 py-3 pl-10 pr-3 text-base text-[#FAF4EB] placeholder-[#8C7E72] focus:border-[#E5C178] focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="auth-signup-password" className="mb-1.5 block text-sm font-medium text-[#B8A692]">Password <span className="text-[#8C7E72]">(at least 6 characters)</span></label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7E72]" />
                  <input
                    id="auth-signup-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(212,163,89,0.25)] bg-[#16100B]/90 py-3 pl-10 pr-3 text-base text-[#FAF4EB] placeholder-[#8C7E72] focus:border-[#E5C178] focus:outline-none focus:ring-1 focus:ring-[#E5C178]"
                  />
                </div>
              </div>
              <p className="text-sm leading-5 text-[#B8A692]">You can add your mobile number when you make a reservation.</p>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] px-4 text-sm font-bold text-[#140E08] shadow-md shadow-[#E5C178]/15 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF4EB] disabled:cursor-wait disabled:opacity-50"
              >
                <span>{isLoading ? "Creating account…" : "Create Account"}</span>
                {!isLoading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-[rgba(212,163,89,0.18)] pt-4 text-center text-sm text-[#B8A692]">
            {authMode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-[#E5C178] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C178]">
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("login")} className="font-semibold text-[#E5C178] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C178]">
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
