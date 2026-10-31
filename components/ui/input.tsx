import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent ${className}`}
      {...props}
    />
  );
}
