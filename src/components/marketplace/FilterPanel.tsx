'use client';

import React, { useEffect, useRef } from 'react';
import { Circle, X } from 'lucide-react';

export interface MarketplaceFilters {
  category: string;
  risks: string[];
  sources: string[];
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  categories: readonly string[];
  riskOptions: string[];
  sourceOptions: string[];
  filters: MarketplaceFilters;
  onCategoryChange: (category: string) => void;
  onToggleRisk: (risk: string) => void;
  onToggleSource: (source: string) => void;
  onClearAll: () => void;
}

export function FilterPanel({
  open,
  onClose,
  categories,
  riskOptions,
  sourceOptions,
  filters,
  onCategoryChange,
  onToggleRisk,
  onToggleSource,
  onClearAll,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Click-away layer */}
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Marketplace filters"
        className="absolute right-0 top-full mt-2 z-40 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-xl border border-gray-200 shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="font-black uppercase text-sm tracking-wider">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black text-sm font-bold uppercase tracking-wide transition-colors"
          >
            Done
          </button>
        </div>

        <div className="px-5 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Category */}
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</legend>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2.5 cursor-pointer text-sm group rounded-md px-1 py-0.5 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="filter-category"
                    checked={filters.category === cat}
                    onChange={() => onCategoryChange(cat)}
                    className="accent-orange-600"
                  />
                  <span className={filters.category === cat ? 'font-semibold text-orange-700' : 'text-gray-600'}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Risk */}
          {riskOptions.length > 0 && (
            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Risk level</legend>
              <div className="space-y-1.5">
                {riskOptions.map((risk) => (
                  <label
                    key={risk}
                    className="flex items-center gap-2.5 cursor-pointer text-sm group rounded-md px-1 py-0.5 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="accent-orange-600"
                      checked={filters.risks.includes(risk)}
                      onChange={() => onToggleRisk(risk)}
                    />
                    <span className="text-gray-600">{risk}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Source */}
          {sourceOptions.length > 0 && (
            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Verified source
              </legend>
              <div className="space-y-1.5">
                {sourceOptions.map((source) => (
                  <label
                    key={source}
                    className="flex items-center gap-2.5 cursor-pointer text-sm group rounded-md px-1 py-0.5 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="accent-orange-600"
                      checked={filters.sources.includes(source)}
                      onChange={() => onToggleSource(source)}
                    />
                    <span className="text-gray-600">{source}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-black transition-colors"
          >
            <Circle className="w-3.5 h-3.5" />
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

/** Small helper for rendering active-filter chips. */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <X className="w-3 h-3 opacity-70" />
    </button>
  );
}
