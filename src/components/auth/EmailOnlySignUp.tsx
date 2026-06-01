"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Phase = "form" | "verify";

const destinationAfterSignUp = "/dashboard";

const socialProviders = [
  { label: "Continue with GitHub", strategy: "oauth_github" },
  { label: "Continue with LinkedIn", strategy: "oauth_linkedin" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatError = (err: unknown) => {
  if (!err) return "Something went wrong. Please try again.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const fromArray = (err as { errors?: { message?: string }[] }).errors?.[0]?.message;
  return fromArray || "Unable to complete sign up.";
};

export default function EmailOnlySignUp() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.replace(destinationAfterSignUp);
    }
  }, [isSignedIn, router]);

  const resetState = () => {
    setPhase("form");
    setEmail("");
    setStatusMessage("");
    setErrorMessage(null);
    signUp?.reset();
  };

  const handleSocialSignUp = async (strategy: string) => {
    if (!signUp) return;
    setErrorMessage(null);
    setStatusMessage("Redirecting to complete sign up...");
    setIsSubmitting(true);

    try {
      const { error } = await signUp.sso({
        strategy,
        redirectUrl: "/",
        redirectCallbackUrl: destinationAfterSignUp,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setErrorMessage(formatError(err));
      setStatusMessage("");
      setIsSubmitting(false);
    }
  };

  const waitForSession = async () => {
    if (!signUp) return;
    const attempts = 15;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const ready = signUp.status === "complete" && Boolean(signUp.createdSessionId);
      if (ready) {
        return;
      }

      if (signUp.status === "missing_requirements" && signUp.missingFields.length > 0) {
        // Skip phone number requirement - only throw error for other missing fields
        const requiredFields = signUp.missingFields.filter(
          (field) => !field.includes("phone")
        );
        
        if (requiredFields.length > 0) {
          const missingList = requiredFields.map((field) => field.replace(/_/g, " ")); 
          throw new Error(`Complete required fields: ${missingList.join(", ")}.`);
        }
        
        // If only phone is missing, force update to skip it
        if (signUp.missingFields.every((field) => field.includes("phone"))) {
          try {
            // Try to update with empty phone to satisfy requirement
            await signUp.update({});
          } catch (e) {
            // Update failed
          }
        }
      }

      await sleep(400);
    }

    // If we're still stuck but only phone is missing, try to proceed anyway
    if (signUp.status === "missing_requirements" && 
        signUp.missingFields.every((field) => field.includes("phone"))) {
      return; // Try to finalize anyway
    }

    throw new Error("We are still finalizing your account. Please try again.");
  };

  const finalizeWithRetry = async () => {
    if (!signUp) return;

    await waitForSession();

    const attempts = 8;
    for (let attempt = 0; attempt < attempts; attempt++) {
      // Check if we can proceed despite missing phone
      const canProceed = 
        signUp.status === "complete" || 
        (signUp.status === "missing_requirements" && 
         signUp.missingFields.every((field) => field.includes("phone")));

      if (canProceed && signUp.createdSessionId) {
        try {
          const { error } = await signUp.finalize({
            navigate: ({ decorateUrl }) => {
              const url = decorateUrl(destinationAfterSignUp);
              if (url.startsWith("http")) {
                window.location.href = url;
              } else {
                router.push(url);
              }
            },
          });

          if (error) {
            throw error;
          }
          
          setStatusMessage("Account created! Redirecting...");
          
          // Wait a bit for session to be fully set
          await sleep(500);
          
          // Now navigate
          router.push(destinationAfterSignUp);
          return;
        } catch (err) {
          const message = (err as any)?.message || "";
          const isPhoneRequired = message.toLowerCase().includes("phone") || message.toLowerCase().includes("missing");
          
          if (isPhoneRequired) {
            await sleep(600);
            continue;
          }
          
          throw err;
        }
      }

      await sleep(500);
    }
    
    throw new Error("Unable to complete sign up. Please try signing in instead.");
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUp) return;

    const formData = new FormData(event.currentTarget);
    const emailAddress = ((formData.get("email") as string) || "").trim();
    const fullName = ((formData.get("name") as string) || "").trim();
    const password = (formData.get("password") as string) || "";

    if (!emailAddress) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters.");
      return;
    }

    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ").trim() || undefined;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.create({
        emailAddress,
        firstName: firstName || undefined,
        lastName,
        password,
      });

      if (error) {
        setErrorMessage(formatError(error));
        return;
      }

      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setErrorMessage(formatError(codeError));
        return;
      }

      setEmail(emailAddress);
      setPhase("verify");
      setStatusMessage("Check your inbox for a six-digit code. Email addresses must be verified for password-based access.");
    } catch (err) {
      setErrorMessage(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signUp) return;

    const formData = new FormData(event.currentTarget);
    const code = ((formData.get("code") as string) || "").trim();

    if (!code) {
      setErrorMessage("Enter the code that we emailed to you.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setErrorMessage(formatError(error));
        return;
      }

      setStatusMessage("Code accepted. Finalizing your account...");

      // Check if phone is the only missing requirement and skip it
      if (signUp.status === "missing_requirements") {
        const nonPhoneFields = signUp.missingFields.filter(
          (field) => !field.includes("phone")
        );
        
        if (nonPhoneFields.length === 0 && signUp.missingFields.length > 0) {
          // Only phone is missing, try to finalize anyway
          setStatusMessage("Completing sign up (phone number skipped)...");
        }
      }

      await finalizeWithRetry();
    } catch (err) {
      setErrorMessage(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!signUp) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await signUp.verifications.sendEmailCode();
      setStatusMessage("We resent the verification code to your email.");
    } catch (err) {
      setErrorMessage(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-gray-200 bg-white p-8">
      <div className="space-y-1 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Create account</p>
        <h1 className="text-2xl font-black">Email, GitHub, or LinkedIn</h1>
        <p className="text-sm text-gray-500">Set a password and confirm the email code, or use one of your connected social accounts.</p>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Use a social account</p>
        {socialProviders.map((provider) => (
          <Button
            key={provider.strategy}
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting || !signUp}
            onClick={() => handleSocialSignUp(provider.strategy)}
          >
            {provider.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-300 mb-6">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-gray-400">or continue with email</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {phase === "form" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" htmlFor="name">
              Full name
            </label>
            <Input id="name" name="name" placeholder="Jane Doe" disabled={isSubmitting || !signUp} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" htmlFor="email">
              Email address
            </label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={isSubmitting || !signUp} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" htmlFor="password">
              Create password
            </label>
            <Input id="password" name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" required disabled={isSubmitting || !signUp} />
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {statusMessage && <p className="text-sm text-brand-primary">{statusMessage}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !signUp}>
            {isSubmitting ? "Sending code..." : "Send verification code"}
          </Button>
        </form>
      )}

      {phase === "verify" && (
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" htmlFor="code">
              Enter verification code
            </label>
            <Input id="code" name="code" inputMode="numeric" placeholder="123456" autoComplete="one-time-code" maxLength={6} disabled={isSubmitting} />
            <p className="text-xs text-gray-500 mt-2">We sent a code to {email}. Because this workspace uses email + password, you must confirm the inbox before your session starts.</p>
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {statusMessage && <p className="text-sm text-brand-primary">{statusMessage}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Create account"}
            </Button>
            <Button type="button" variant="outline" onClick={resendCode} disabled={isSubmitting}>
              Resend
            </Button>
          </div>
          <button type="button" className="text-xs uppercase tracking-widest text-gray-400 hover:text-black" onClick={resetState}>
            Start over
          </button>
        </form>
      )}

      {/* Required placeholder for Clerk smart CAPTCHA in custom flows */}
      <div id="clerk-captcha" className="hidden" aria-hidden />
    </div>
  );
}
