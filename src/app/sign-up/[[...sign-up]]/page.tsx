import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center py-24 min-h-[80vh]">
      <SignUp 
        fallbackRedirectUrl="/"
        signInFallbackRedirectUrl="/"
      />
    </div>
  );
}