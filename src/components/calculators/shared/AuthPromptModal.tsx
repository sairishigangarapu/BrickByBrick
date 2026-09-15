"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function AuthPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to download reports</h2>
        <p className="text-gray-600 mb-6">
          Sign up for a free WelNex account to download unlimited calculator reports, save your progress, and access more exciting features!
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/sign-up" 
            className="w-full text-center px-4 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 transition-colors"
          >
            Create Free Account
          </Link>
          <Link 
            href="/sign-in" 
            className="w-full text-center px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
