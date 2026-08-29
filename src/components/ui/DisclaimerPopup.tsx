'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, X } from 'lucide-react';

const STORAGE_KEY = 'brickbybrick_disclaimer_accepted';
const BANNER_KEY = 'bbb_investment_disclaimer_dismissed';

type Variant = 'modal' | 'banner';

interface DisclaimerPopupProps {
  variant?: Variant;
}

export function DisclaimerPopup({ variant = 'modal' }: DisclaimerPopupProps) {
  const storageKey = variant === 'banner' ? BANNER_KEY : STORAGE_KEY;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(storageKey);
      if (!accepted) {
        setIsVisible(true);
        if (variant === 'modal') {
          document.body.style.overflow = 'hidden';
        }
      }
    } catch {
      // localStorage unavailable; fail open
    }
  }, [storageKey, variant]);

  const handleAccept = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      /* ignore */
    }
    setIsVisible(false);
    if (variant === 'modal') {
      document.body.style.overflow = 'unset';
    }
  };

  if (!isVisible) return null;

  if (variant === 'banner') {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-40">
        <div className="bg-zinc-900 text-white border border-zinc-800 rounded-lg shadow-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">Investment disclaimer</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Alternative investments carry significant risk, including loss of principal. Information on BrickByBrick is
              educational and does not constitute financial advice. Always consult a registered advisor.
            </p>
            <button
              type="button"
              onClick={handleAccept}
              className="mt-3 text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400"
            >
              Got it
            </button>
          </div>
          <button
            type="button"
            onClick={handleAccept}
            aria-label="Dismiss disclaimer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <Card className="border-orange-500/20 shadow-xl overflow-hidden">
          <div className="bg-orange-500 h-2 w-full" />
          <CardHeader className="bg-orange-50/50 pb-6 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black uppercase text-gray-900">
                Important Disclaimer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                The information provided on <span className="font-bold text-gray-900">BrickByBrick</span> is for educational and informational purposes only and does not constitute financial, investment, legal, or tax advice.
              </p>
              <p>
                <span className="font-bold text-gray-900">Alternative investments carry significant risks</span>, including the potential loss of principal. These investments are often illiquid and may not be suitable for all investors.
              </p>
              <p>
                We strongly advise you to consult with a registered financial advisor or independently evaluate any opportunity before making investment decisions. Past performance is not indicative of future results.
              </p>
            </div>

            <div className="mt-8">
              <Button
                onClick={handleAccept}
                className="w-full h-12 text-base font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white"
              >
                I Understand & Agree
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
