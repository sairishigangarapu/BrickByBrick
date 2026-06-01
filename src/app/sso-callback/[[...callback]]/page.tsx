import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-xs uppercase tracking-widest text-gray-500">Finalizing sign in</p>
        <AuthenticateWithRedirectCallback />
        <p className="text-sm text-gray-500">Hang tight—once Clerk confirms your GitHub, LinkedIn, or email credentials we will send you back to the dashboard.</p>
      </div>
    </div>
  );
}
