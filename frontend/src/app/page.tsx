/**
 * Landing Page - single-screen, no scroll.
 * Full viewport hero with real cab imagery and a clear CTA.
 * Desktop: left text + right image grid. Mobile: stacked.
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  // Auth State
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Read localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("authRole");
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (userRole === "ADMIN") {
      router.push("/dashboard");
    } else {
      // It's an Employee, so log them out
      localStorage.removeItem("authToken");
      localStorage.removeItem("authRole");
      setIsAuthenticated(false);
      setUserRole(null);
      window.location.reload();
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* ── Background: looping video ─────────────── */}
      <video
        className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/homeVideo.mp4" type="video/mp4" />
      </video>

      {/* ── Dark gradient overlay ─────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/65 via-gray-950/45 to-gray-950/20" />

      {/* ── Two-column layout ─────────────────────── */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Text + CTAs ─────────────────── */}
          <div>
            <span className="font-[family-name:var(--font-inter)] inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-6">
              Trusted Mobility Insights
            </span>

            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-5">
              Your feedback
              <br />
              drives <span className="text-blue-500 [text-shadow:0_1px_6px_rgba(0,0,0,0.25)]">change.</span>
            </h1>

            <p className="font-[family-name:var(--font-inter)] text-gray-300 font-medium text-base sm:text-lg leading-relaxed max-w-md mb-8 lg:mb-10">
              Help us keep every ride safe, smooth, and professional.
              Share your experience with your driver. It only takes a moment.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Dynamic Auth Button - Placed to the LEFT of Give Feedback */}
              {isClient && (
                <button
                  onClick={handleAuthAction}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 text-white text-sm font-semibold tracking-wide rounded-lg hover:bg-blue-700 transition-all shadow-lg border border-blue-500/30"
                >
                  {!isAuthenticated ? "Login" : userRole === "ADMIN" ? "Dashboard" : "Logout"}
                </button>
              )}

              {(!isAuthenticated || userRole !== "ADMIN") && (
                <Link
                  href="/feedback"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-gray-900 text-sm font-semibold tracking-wide rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                >
                  Give your valuable feedback
                </Link>
              )}
            </div>
          </div>

          {/* ── RIGHT (desktop) / Bottom (mobile): image mosaic ── */}
          <div className="flex flex-col gap-3 lg:gap-3 items-center lg:items-end justify-center lg:justify-start mt-4 lg:mt-0">

            {/* ── Desktop: irregular mosaic ───────── */}
            <div className="hidden lg:grid grid-cols-6 auto-rows-[50px] gap-3 w-full max-w-md">
              <div className="relative col-span-4 row-span-3 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img1.jpg"
                  alt="Transport scene 1"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="relative col-span-2 row-span-3 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img2.jpg"
                  alt="Transport scene 2"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-3 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img3.jpg"
                  alt="Transport scene 3"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-3 row-span-3 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img4.png"
                  alt="Transport scene 4"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img5.jpeg"
                  alt="Transport scene 5"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-4 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="/homeImg/img6.jpg"
                  alt="Transport scene 6"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* ── Mobile: arranged mixed-size grid ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:hidden w-full">
              {/* Row 1: one large + two stacked */}
              <div className="relative col-span-2 row-span-2 h-36 sm:h-44 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img1.jpg"
                  alt="Transport scene 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[68px] sm:h-[86px] rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img2.jpg"
                  alt="Transport scene 2"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[68px] sm:h-[86px] rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img3.jpg"
                  alt="Transport scene 3"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Row 2: three equal */}
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img4.png"
                  alt="Transport scene 4"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img5.jpeg"
                  alt="Transport scene 5"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="/homeImg/img6.jpg"
                  alt="Transport scene 6"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
