"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Phase = "password" | "mfa";

const destinationAfterLogin = "/dashboard";

const oauthProviders = [
  { label: "Continue with GitHub", strategy: "oauth_github" },
  { label: "Continue with LinkedIn", strategy: "oauth_linkedin" },
];

const computeError = (err: unknown) => {
  if (!err) return "Something went wrong. Please try again.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const maybeMessage = (err as { errors?: { message?: string }[] }).errors?.[0]?.message;
  return maybeMessage || "Authentication failed. Please try again.";
};

export default function EmailOnlySignIn() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const [phase, setPhase] = useState<Phase>("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFlow = () => {
    setPhase("password");
    setEmail("");
    setStatusMessage("");
    setErrorMessage(null);
  };

  const finalizeSignIn = async () => {
    if (!signIn) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl(destinationAfterLogin);
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
      return;
    }

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
      setPhase("mfa");
      setStatusMessage("Confirm this device with the email code we just sent.");
      return;
    }
  };

  const handleOAuthSignIn = async (strategy: string) => {
    if (!signIn) return;
    setErrorMessage(null);
    setStatusMessage("Redirecting to provider...");
    setIsSubmitting(true);

    try {
      const { error } = await signIn.sso({
        strategy: strategy as "oauth_github" | "oauth_linkedin",
        redirectUrl: "/",
        redirectCallbackUrl: destinationAfterLogin,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setErrorMessage(computeError(err));
      setStatusMessage("");
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signIn) return;

    const formData = new FormData(event.currentTarget);
    const identifier = ((formData.get("email") as string) || "").trim();
    const password = (formData.get("password") as string) || "";

    if (!identifier) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signIn.password({ identifier, password });

      if (error) {
        setErrorMessage(computeError(error));
        return;
      }

      setEmail(identifier);
      await finalizeSignIn();
    } catch (err) {
      setErrorMessage(computeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signIn) return;

    const formData = new FormData(event.currentTarget);
    const code = ((formData.get("code") as string) || "").trim();
    if (!code) {
      setErrorMessage("Enter the confirmation code we sent to your email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });

      if (error) {
        setErrorMessage(computeError(error));
        return;
      }

      await finalizeSignIn();
    } catch (err) {
      setErrorMessage(computeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!signIn) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
    if (phase === "mfa") {
      await signIn.mfa.sendEmailCode();
    }
    setStatusMessage("We just sent you a fresh code.");
  } catch (err) {
    setErrorMessage(computeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-gray-200 bg-white p-8">
      <div className="space-y-1 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Sign in</p>
        <h1 className="text-2xl font-black">Email, GitHub, or LinkedIn</h1>
        <p className="text-sm text-gray-500">Use your password or hop over to GitHub/LinkedIn—new devices still confirm via email.</p>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Use a social account</p>
        {oauthProviders.map((provider) => (
          <Button
            key={provider.strategy}
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting || !signIn}
            onClick={() => handleOAuthSignIn(provider.strategy)}
          >
            {provider.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-300 mb-6">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-gray-400">or use email</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {phase === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={isSubmitting || !signIn} />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
            <Input id="password" name="password" type="password" placeholder="Your password" autoComplete="current-password" required disabled={isSubmitting || !signIn} />
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {statusMessage && <p className="text-sm text-brand-primary">{statusMessage}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !signIn}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      )}

      {phase === "mfa" && (
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div>
            <label htmlFor="mfa" className="block text-xs font-bold uppercase tracking-widest mb-2">Confirm New Device</label>
            <Input id="mfa" name="code" inputMode="numeric" placeholder="123456" autoComplete="one-time-code" maxLength={6} disabled={isSubmitting} />
            <p className="text-xs text-gray-500 mt-2">We emailed a second confirmation to {email}.</p>
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {statusMessage && <p className="text-sm text-brand-primary">{statusMessage}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="outline" onClick={resendCode} disabled={isSubmitting}>
              Resend
            </Button>
          </div>
          <button type="button" onClick={resetFlow} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black">
            Back to password
          </button>
        </form>
      )}
    </div>
  );
}
