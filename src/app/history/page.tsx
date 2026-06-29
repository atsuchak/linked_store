"use client";

import { useLinkStore } from "@/store/linkStore";
import { LinkCard } from "@/components/LinkCard";
import { History, Search, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { ChevronLeft, ChevronRight, ListOrdered } from "lucide-react";

export default function HistoryPage() {
  const { localLinks, removeLocalLink, updateLocalLink } = useLinkStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter, itemsPerPage]);

  const filteredLinks = useMemo(() => {
    return localLinks.filter((link) => {
      // 1. Search Filter
      const matchesSearch =
        link.title?.toLowerCase().includes(search.toLowerCase()) ||
        link.description?.toLowerCase().includes(search.toLowerCase()) ||
        link.url.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Date Filter
      if (dateFilter === "all") return true;
      
      const linkDate = new Date(link.createdAt).getTime();
      const now = new Date().getTime();
      const diffDays = (now - linkDate) / (1000 * 3600 * 24);

      if (dateFilter === "today") return diffDays <= 1;
      if (dateFilter === "7days") return diffDays <= 7;
      if (dateFilter === "15days") return diffDays <= 15;
      if (dateFilter === "30days") return diffDays <= 30;

      return true;
    });
  }, [localLinks, search, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / itemsPerPage));
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <BackgroundEffects />
      <div className="w-full max-w-4xl mx-auto space-y-8 mt-4 sm:mt-8 z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center tracking-tight">
              <History className="w-8 h-8 mr-3 text-indigo-500 dark:text-cyan-400" />
              Your Link History
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            
            <div className="relative w-full sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
              >
                <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Time</option>
                <option value="today" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Today</option>
                <option value="7days" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Last 7 Days</option>
                <option value="15days" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Last 15 Days</option>
                <option value="30days" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Last 30 Days</option>
              </select>
            </div>

          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-24 px-4 border border-dashed border-white/20 dark:border-white/10 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-md">
            <History className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">No links found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              {search || dateFilter !== 'all' ? "No links match your filter criteria." : "You haven't saved any links yet."}
            </p>
            {(!search && dateFilter === 'all') && (
              <Link href="/" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white rounded-full font-medium transition-all shadow-lg">
                Go back to Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              {paginatedLinks.map((link) => (
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  onDelete={removeLocalLink}
                  onEdit={updateLocalLink}
                  searchTerm={search}
                />
              ))}
            </div>

            {filteredLinks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl mt-4">
                <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                  {[20, 50, 100].map(num => (
                    <button
                      key={num}
                      onClick={() => setItemsPerPage(num)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        itemsPerPage === num 
                          ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-cyan-400 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
