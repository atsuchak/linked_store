"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, AlignLeft, Type, Plus } from "lucide-react";
import { useLinkStore } from "@/store/linkStore";
import { useSession } from "next-auth/react";

export function LinkInputForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const { addLocalLink } = useLinkStore();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Auto-add https:// if not present
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    if (session) {
      // User is logged in, save to DB
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formattedUrl, title, description }),
        });
        if (res.ok) {
          console.log("Link saved to DB");
        }
      } catch (error) {
        console.error("Failed to save link", error);
      }
    } else {
      // User not logged in, save locally
      addLocalLink({ url: formattedUrl, title, description });
    }

    setUrl("");
    setTitle("");
    setDescription("");
    setIsFocused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form
        onSubmit={handleSubmit}
        className={`relative group bg-white/5 dark:bg-black/20 backdrop-blur-xl border transition-all duration-500 rounded-3xl p-6 shadow-2xl overflow-hidden ${
          isFocused ? "border-indigo-500/50 dark:border-cyan-400/50" : "border-white/20 dark:border-white/10"
        }`}
      >
        {/* Glow effect on focus */}
        <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-400/10 transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative z-10 flex flex-col space-y-4">
          {/* Main URL Input */}
          <div className="relative rounded-2xl overflow-hidden p-[2px]">
            {/* Spinning light border */}
            <div className={`absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#6366f1_80%,#22d3ee_100%)] transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
            
            <div className="relative flex items-center space-x-4 bg-white dark:bg-[#09090b] p-4 rounded-[14px]">
              <LinkIcon className={`w-6 h-6 transition-colors ${isFocused ? 'text-indigo-500 dark:text-cyan-400' : 'text-slate-400'}`} />
              <input
                type="text"
                required
                placeholder="Paste your link here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (!url && !title && !description) setIsFocused(false);
                }}
                className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          <AnimatePresence>
            {(isFocused || url || title || description) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Title Input */}
                <div className="flex items-center space-x-4 bg-white/5 dark:bg-black/40 p-3 rounded-2xl border border-white/10 ml-4">
                  <Type className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Title (Optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                {/* Description Input */}
                <div className="flex items-start space-x-4 bg-white/5 dark:bg-black/40 p-3 rounded-2xl border border-white/10 ml-4">
                  <AlignLeft className="w-5 h-5 text-slate-400 mt-1" />
                  <textarea
                    placeholder="Description (Optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!url}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-500/25 border border-white/10"
                  >
                    <span>Save Link</span>
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}
