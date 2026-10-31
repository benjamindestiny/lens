import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${className}`}
      {...props}
    />
  );
}

export function CardBody({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`p-5 ${className}`} {...props} />;
}
