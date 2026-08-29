'use client';

import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'bbb_cookie_consent';

interface ConsentValue {
  choice: 'accept' | 'reject' | 'custom';
  prefs: { analytics: boolean; marketing: boolean };
  ts: string;
}

function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'choice' in parsed) {
      return parsed as ConsentValue;
    }
  } catch {
    /* localStorage unavailable or invalid JSON */
  }
  return null;
}

function writeConsent(consent: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* localStorage unavailable */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handle = (choice: ConsentValue['choice'], prefs: ConsentValue['prefs']) => {
    writeConsent({ choice, prefs, ts: new Date().toISOString() });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Cookie className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">We use cookies</p>
            <p className="text-xs text-zinc-600 leading-relaxed mt-1">
              BrickByBrick uses essential cookies to run the site. Optional analytics and marketing cookies help us
              improve the experience. You can change your choice at any time.
            </p>
            {showSettings && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Essential (always on)</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Analytics</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Marketing</span>
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-zinc-900"
          >
            {showSettings ? 'Hide settings' : 'Settings'}
          </button>
          <button
            type="button"
            onClick={() => handle('reject', { analytics: false, marketing: false })}
            className="h-10 px-4 border border-zinc-300 text-zinc-800 font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-50 text-xs"
          >
            Reject non-essential
          </button>
          {showSettings ? (
            <button
              type="button"
              onClick={() => handle('custom', { analytics, marketing })}
              className="h-10 px-4 bg-zinc-900 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 text-xs"
            >
              Save settings
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => handle('accept', { analytics: true, marketing: true })}
            className="h-10 px-4 bg-orange-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-orange-700 text-xs"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
