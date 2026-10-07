"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { User, History as HistoryIcon, Download } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data.image) setProfileImage(data.image);
        })
        .catch(console.error);
    }
  }, [session]);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Link <span className="text-indigo-500 dark:text-cyan-400">Base</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/history" className="flex items-center space-x-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-white/10">
              <HistoryIcon className="w-5 h-5" />
              <span className="hidden sm:inline">History</span>
            </Link>
            
            <ThemeToggle />

            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse ml-2" />
            ) : session ? (
              <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-4">
                <Link 
                  href="/profile" 
                  className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                  aria-label="Profile"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 space-x-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white text-sm font-medium transition-colors shadow-sm ml-2"
                aria-label="Sign In"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
