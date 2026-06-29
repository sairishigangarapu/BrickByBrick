"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Download } from "lucide-react";
import AuthPromptModal from "./AuthPromptModal";
import generatePDF from "react-to-pdf";

export default function DownloadPDFButton({ targetRef, filename = "report.pdf" }: { targetRef: React.RefObject<any | null>, filename?: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleDownload = () => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    if (targetRef.current) {
      generatePDF(targetRef, { filename });
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={!isLoaded}
        className="flex items-center gap-2 px-4 py-2 mt-6 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 transition-colors w-full sm:w-auto justify-center"
      >
        <Download size={18} />
        Download Report as PDF
      </button>

      {showAuthModal && (
        <AuthPromptModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
