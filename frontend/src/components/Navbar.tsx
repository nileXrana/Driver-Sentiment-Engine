// Navigation Component

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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

  // Authentication
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Initialize auth
  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("authRole");
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");
    setIsAuthenticated(false);
    setUserRole(null);
    window.location.href = "/";
  };

  return (
    <nav className={`${isHome ? "absolute top-0 left-0 right-0 z-50 bg-transparent" : "sticky top-0 z-50 bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 shadow-lg"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2">
          <span className={`text-base sm:text-xl font-bold truncate ${isHome ? "text-white" : "text-white"}`}>
            Driver Sentiment Engine
          </span>
        </Link>

        {/* Navigation Actions */}
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

          {/* Desktop Links */}
          <div className="hidden sm:flex gap-1 items-center">
            {NAV_LINKS.map((link: NavLink) => {
              // Role visibility checks
              if (link.label === "Dashboard" && userRole === "EMPLOYEE") return null;
              if (link.label === "Give Feedback" && userRole === "ADMIN") return null;

              const isActive = pathname === link.href;
              const baseStyle = isHome
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white";
              const activeStyle = isHome
                ? "bg-white/15 text-white"
                : "bg-white/15 text-white";

              let targetHref = link.href;
              // Redirect unauthenticated dashboard access
              if (link.label === "Dashboard" && !isAuthenticated) {
                targetHref = "/login";
              }

              return (
                <Link
                  key={link.label}
                  href={targetHref}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? activeStyle : baseStyle
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Login/Logout Button */}
            {isClient && (
              <button
                onClick={isAuthenticated ? handleLogout : () => window.location.href = "/login"}
                className={`ml-1 px-4 py-2 rounded-lg text-sm font-medium transition ${isHome
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {isAuthenticated ? "Logout" : "Login"}
              </button>
            )}
          </div>

          {/* Bell placeholder */}
          <div className="hidden sm:flex w-10 h-10 items-center justify-center">
            {isDashboard && isAuthenticated ? <NotificationBell /> : <div className="w-10 h-10" />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {NAV_LINKS.map((link: NavLink) => {
              // Role visibility checks
              if (link.label === "Dashboard" && userRole === "EMPLOYEE") return null;
              if (link.label === "Give Feedback" && userRole === "ADMIN") return null;

              const isActive = pathname === link.href;
              const baseStyle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";
              const activeStyle = "bg-gray-900 text-white";

              let targetHref = link.href;
              // Redirect unauthenticated dashboard access
              if (link.label === "Dashboard" && !isAuthenticated) {
                targetHref = "/login";
              }

              return (
                <Link
                  key={link.label}
                  href={targetHref}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? activeStyle : baseStyle
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Auth Toggle */}
            {isClient && (
              <button
                onClick={isAuthenticated ? handleLogout : () => window.location.href = "/login"}
                className="w-full text-left block mt-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
              >
                {isAuthenticated ? "Logout" : "Login"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
