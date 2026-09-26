import React from "react";
import Link from "next/link";

interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  direction?: "right" | "left" | "up" | "up-right";
  color?: "white" | "primary" | "dim";
  className?: string;
  external?: boolean;
}

export function ArrowLink({
  href,
  children,
  direction = "right",
  color = "primary",
  className = "",
  external = false,
}: ArrowLinkProps) {
  const colorMap = {
    white: "text-white hover:text-primary",
    primary: "text-primary hover:text-white",
    dim: "text-paper-dim hover:text-white",
  };

  const getArrowSymbol = () => {
    switch (direction) {
      case "left":
        return "←";
      case "up":
        return "↑";
      case "up-right":
        return "↗";
      case "right":
      default:
        return "→";
    }
  };

  const getMotionClass = () => {
    switch (direction) {
      case "left":
        return "group-hover:-translate-x-1";
      case "up":
        return "group-hover:-translate-y-1";
      case "up-right":
        return "group-hover:translate-x-0.5 group-hover:-translate-y-0.5";
      case "right":
      default:
        return "group-hover:translate-x-1";
    }
  };

  const arrow = (
    <span
      className={`inline-block transition-transform duration-200 ${getMotionClass()}`}
      aria-hidden="true"
    >
      {getArrowSymbol()}
    </span>
  );

  const content = (
    <>
      {direction === "left" && <span className="mr-1.5">{arrow}</span>}
      <span>{children}</span>
      {direction !== "left" && <span className="ml-1.5">{arrow}</span>}
    </>
  );

  const classes = `group inline-flex items-center font-label-action uppercase tracking-widest text-label-action transition-colors select-none py-1 min-h-[44px] ${colorMap[color]} ${className}`.trim();

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
