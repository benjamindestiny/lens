"use client";
import { useState, type ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & { showToggle?: boolean };

export function Input({ className = "", showToggle, type, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && visible ? "text" : type;

  return (
    <div className="relative">
      <input
        type={actualType}
        className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent ${className}`}
        {...props}
      />
      {isPassword && showToggle && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
