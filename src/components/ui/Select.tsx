"use client";

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  onValueChange?: (value: string[]) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

type SelectComponentProps = React.ComponentPropsWithRef<'div'> & SelectProps;

const Select = React.forwardRef<HTMLDivElement>((
  props: SelectComponentProps
) => {
  const { onValueChange, defaultValue, placeholder, disabled, multiple, className, ...restProps } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>(defaultValue ? [defaultValue] : []);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => setOpen(!open);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown') setOpen(true);
    if (e.key === 'ArrowUp') setOpen(true);
    if (e.key === 'Enter') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={restProps.ref}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative inline-flex flex-col",
        "w-full rounded-md border border-gray-300 bg-white py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...restProps}
    >
      <button
        className="flex w-full justify-between items-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 outline-none focus:outline-none disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select"
      >
        <span>{placeholder || 'Select'}</span>
        <svg className="fill-current text-gray-300 w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-full rounded-md bg-white shadow-lg z-10 overflow-hidden ring-1 ring-black ring-opacity-5 max-h-64 overflow-y-auto mt-0">
          {multiple ? (
            <div className="flex flex-wrap gap-1.5 px-1 py-1 text-sm">
              {value.map((tag: string) => (
                <span key={tag} className="flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const newValue = value.filter((v: string) => v !== tag);
                      setValue(newValue);
                      onValueChange?.(newValue);
                    }}
                    className="ml-1 text-xs font-medium text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="px-1 py-1 text-sm">
              {value.map((option: string, index: number) => (
                <button
                  key={option}
                  onClick={() => {
                    setValue([option]);
                    setOpen(false);
                    onValueChange?.([option]);
                  }}
                  className="flex items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-100"
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}

          {!value.length && !open && (
            <div className="px-1 py-1 text-sm text-gray-400 cursor-default select-none">
              {placeholder || 'Select'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

export { Select };
export type { SelectProps };