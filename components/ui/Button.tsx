import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  href?: string;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  href,
  arrow = true,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-label-action uppercase tracking-widest transition-colors select-none min-h-[44px] cursor-pointer text-center font-bold";

  let variantStyles = "";
  if (variant === "primary" || variant === "accent") {
    // Treatment 1 — Primary CTA: Hairline outlined button, neutral/white structure, no solid crimson fill
    variantStyles =
      "bg-black text-white border border-white hover:border-primary hover:text-white px-6 py-3.5";
  } else {
    // Treatment 2 — Secondary CTA: Understated text + arrow, no border container, no fill
    variantStyles =
      "bg-transparent text-white border-0 hover:text-primary px-0 py-2";
  }

  const arrowElement = arrow ? (
    <span
      className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
      aria-hidden="true"
    >
      →
    </span>
  ) : null;

  const combinedClasses = `group ${baseStyles} ${variantStyles} ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        onClick={props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
        {arrowElement}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
      {arrowElement}
    </button>
  );
}
