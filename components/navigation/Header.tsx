"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/work", label: "WORK" },
  { href: "/case-studies", label: "CASE STUDIES" },
  { href: "/services", label: "SERVICES" },
  { href: "/about", label: "ABOUT" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-black border-b border-[#262626]">
        <div className="h-[72px] max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-white select-none"
              aria-label="ÖTZI Agency Home"
            >
              <Image
                src="/logo.png"
                alt="ötzi"
                width={1024}
                height={409}
                priority
                className="h-7 sm:h-8 md:h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8"
            aria-label="Primary Navigation"
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-label-action text-label-action uppercase tracking-widest transition-colors py-1 ${
                    isActive
                      ? "text-white border-b-2 border-primary pb-0.5"
                      : "text-paper-dim hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <Button
              variant="accent"
              href="/contact"
              className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              BOOK OUR SERVICES
            </Button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="md:hidden flex items-center justify-center w-11 h-11 border border-[#262626] text-white hover:border-white transition-colors cursor-pointer select-none"
            >
              {isMobileMenuOpen ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M1 1L17 17M17 1L1 17" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M1 4h16M1 9h16M1 14h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={handleClose}
      />
    </>
  );
}
