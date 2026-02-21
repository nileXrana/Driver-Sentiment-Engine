/**
 * Landing Page — single-screen, no scroll.
 * Full viewport hero with real cab imagery and a clear CTA.
 * Desktop: left text + right image grid. Mobile: stacked.
 */

"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
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

            <p className="font-[family-name:var(--font-inter)] text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mb-8 lg:mb-10">
              Help us keep every ride safe, smooth, and professional.
              Share your experience with your driver. It only takes a moment.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-gray-900 text-sm font-semibold tracking-wide rounded-lg hover:bg-gray-100 transition-all shadow-lg"
              >
                Give your valuable feedback
              </Link>
            </div>
          </div>

          {/* ── RIGHT (desktop) / Bottom (mobile): image mosaic ── */}
          <div className="flex flex-col gap-3 lg:gap-3 items-center lg:items-end justify-center lg:justify-start mt-4 lg:mt-0">

            {/* ── Desktop: irregular mosaic ───────── */}
            <div className="hidden lg:grid grid-cols-6 auto-rows-[50px] gap-3 w-full max-w-md">
              <div className="relative col-span-4 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1556122071-e404eaedb77f?w=600&q=80"
                  alt="Cab driver smiling at camera"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400&q=80"
                  alt="Passenger in a cab"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-3 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80"
                  alt="City bus on the road"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-3 row-span-3 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&q=80"
                  alt="Fleet of taxis lined up"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80"
                  alt="Car on the road"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-4 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&q=80"
                  alt="Driver behind the wheel"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-2 row-span-2 rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"
                  alt="Woman working on laptop"
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
                  src="https://images.unsplash.com/photo-1556122071-e404eaedb77f?w=500&q=80"
                  alt="Cab driver smiling"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[68px] sm:h-[86px] rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=300&q=80"
                  alt="Passenger in a cab"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-[68px] sm:h-[86px] rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=300&q=80"
                  alt="Fleet of taxis"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Row 2: three equal */}
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&q=80"
                  alt="City bus on the road"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80"
                  alt="Car on the road"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-white/15 shadow-xl opacity-75">
                <Image
                  src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=300&q=80"
                  alt="Driver behind the wheel"
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
