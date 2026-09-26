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
  if (variant === "primary") {
    variantStyles =
      "bg-white text-black hover:bg-primary hover:text-white px-6 py-3.5 border border-transparent";
  } else if (variant === "accent") {
    variantStyles =
      "bg-primary text-white hover:bg-white hover:text-black px-6 py-3.5 border border-transparent";
  } else if (variant === "secondary") {
    variantStyles =
      "bg-black text-white border border-[#6b6b6b] hover:border-white px-6 py-3.5";
  } else if (variant === "ghost") {
    variantStyles =
      "bg-transparent text-white hover:underline decoration-1 underline-offset-4 px-2 py-2";
  }

  const arrowElement = arrow ? (
    <span
      className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1"
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
