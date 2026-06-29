"use client";

import { useLinkStore } from "@/store/linkStore";
import { LinkCard } from "./LinkCard";
import { Clock } from "lucide-react";
import Link from "next/link";

export function RecentLinks() {
  const { localLinks, removeLocalLink, updateLocalLink } = useLinkStore();
  
  const recentLinks = localLinks.slice(0, 6);

  if (recentLinks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/20 dark:border-white/10 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-md">
        <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">No recent links</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Links you save will appear here. Start by adding one above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-indigo-500 dark:text-cyan-400" />
          Recent Links
        </h2>
        {localLinks.length > 6 && (
          <Link href="/history" className="text-sm font-medium text-indigo-500 dark:text-cyan-400 hover:underline">
            View all &rarr;
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recentLinks.map((link) => (
          <LinkCard 
            key={link.id} 
            link={link} 
            onDelete={removeLocalLink}
            onEdit={updateLocalLink}
          />
        ))}
      </div>
    </div>
  );
}
