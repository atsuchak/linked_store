"use client";

import { Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function DownloadAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium border border-slate-200 dark:border-slate-700 pointer-events-none"
          >
            Download Android App
          </motion.div>
        )}
      </AnimatePresence>
      <a
        href="/download/app.apk"
        download="link_save.apk"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-full shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 group"
        aria-label="Download Android App"
      >
        <Download className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}
