"use client";

import React, { useRef } from "react";
import DownloadPDFButton from "./DownloadPDFButton";

export default function CalculatorWrapper({ children, title }: { children: React.ReactNode, title: string }) {
  const reportRef = useRef(null);
  
  return (
    <div className="flex flex-col gap-6 w-full">
      <div 
        ref={reportRef} 
        className="bg-white p-2 sm:p-6 rounded-lg w-full text-gray-800"
      >
        {children}
      </div>
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <DownloadPDFButton targetRef={reportRef} filename={`${title.replace(/\s+/g, '-')}-Report.pdf`} />
      </div>
    </div>
  );
}
