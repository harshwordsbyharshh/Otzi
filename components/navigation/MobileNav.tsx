"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/work", label: "WORK" },
  { href: "/case-studies", label: "CASE STUDIES" },
  { href: "/services", label: "SERVICES" },
  { href: "/about", label: "ABOUT" },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close only when pathname actually changes after initial mount
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 top-[72px] z-50 bg-black flex flex-col justify-between border-t border-[#262626] p-6 animate-none"
    >
      <nav className="flex flex-col gap-2 pt-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between py-4 text-headline-md font-headline-md uppercase tracking-tight transition-colors border-b border-[#262626] min-h-[44px] ${
                isActive ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              <span>{link.label}</span>
              <span className="text-paper-dim text-lg" aria-hidden="true">→</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 pb-8 border-t border-[#262626] flex flex-col gap-4">
        <Button
          variant="accent"
          href="/contact"
          onClick={onClose}
          className="w-full text-center py-4"
        >
          START A PROJECT
        </Button>
        <div className="flex justify-between items-center text-label-mono font-label-mono text-paper-dim uppercase pt-2">
          <span>ÖTZI STUDIO</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}
