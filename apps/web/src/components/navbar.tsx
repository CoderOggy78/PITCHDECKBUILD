"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  useEffect(() => {
    // Enforce dark mode and clean up any previous light theme setting
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    try {
      localStorage.removeItem("vf_theme");
    } catch {
      // ignore
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md transition-all duration-300 border-b border-white/10 bg-[#07090E]/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Brand Logo */}
        <Link href="/" className="navbar-brand group flex items-baseline gap-1">
          <span className="font-serif-hero text-2xl sm:text-3xl font-semibold tracking-wide text-white transition-opacity group-hover:opacity-80">
            VentureForge
          </span>
          <span className="text-[10px] font-sans font-bold tracking-widest text-slate-400">®</span>
        </Link>

        {/* Centered Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <Link
            href="/"
            className={`transition-colors hover:text-white ${
              pathname === "/" ? "text-white font-bold" : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/dashboard") || pathname.startsWith("/project")
                ? "text-white font-bold"
                : ""
            }`}
          >
            Studio
          </Link>
          <Link
            href="/references"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/references") ? "text-white font-bold" : ""
            }`}
          >
            References
          </Link>
          <Link
            href="/knowledge"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/knowledge") ? "text-white font-bold" : ""
            }`}
          >
            Knowledge
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Begin Journey Pill Button */}
          <Link
            href="/wizard"
            className="glass-pill px-5 py-2 rounded-full text-xs sm:text-sm font-semibold !text-white transition-all active:scale-95 shadow-md"
          >
            Begin Journey
          </Link>
        </div>
      </div>
    </header>
  );
}
