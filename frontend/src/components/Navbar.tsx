/**
 * Navbar.tsx
 * -----------
 * Responsive navigation bar. Compact on mobile, full links on desktop.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/feedback", label: "Give Feedback" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
    const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className={`${isHome ? "absolute top-0 left-0 right-0 z-50 bg-transparent" : "sticky top-0 z-50 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 shadow-lg"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-2">
          <span className={`text-base sm:text-xl font-bold truncate ${isHome ? "text-white" : "text-white"}`}>
            Driver Sentiment Engine
          </span>
        </Link>

        {/* Right side: bell + hamburger (mobile) / bell + links (desktop) */}
        <div className="flex items-center gap-1">
          {/* Hamburger button - mobile only */}
          {/* Mobile alert bell (shown only on dashboard) */}
          {isDashboard && (
            <div className="flex sm:hidden mr-2 items-center">
              <NotificationBell />
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`sm:hidden p-2 rounded-lg transition ${isHome ? "text-white hover:bg-white/10" : "text-white hover:bg-white/10"}`}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop nav links */}
          <div className="hidden sm:flex gap-1">
            {NAV_LINKS.map((link: NavLink) => {
            const isActive = pathname === link.href;
            const baseStyle = isHome
              ? "text-white/70 hover:bg-white/10 hover:text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white";
            const activeStyle = isHome
              ? "bg-white/15 text-white"
              : "bg-white/15 text-white";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? activeStyle : baseStyle
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          </div>

          {/* Reserve space for notification bell so navbar doesn't shift when toggling dashboard */}
          <div className="hidden sm:flex w-10 h-10 items-center justify-center">
            {isDashboard ? <NotificationBell /> : <div className="w-10 h-10" />}
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {NAV_LINKS.map((link: NavLink) => {
            const isActive = pathname === link.href;
            const baseStyle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";
            const activeStyle = "bg-gray-900 text-white";

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? activeStyle : baseStyle
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          </div>
        </div>
      )}
    </nav>
  );
}
