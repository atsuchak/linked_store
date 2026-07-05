"use client";

import { useLinkStore } from "@/store/linkStore";
import { LinkCard } from "@/components/LinkCard";
import { History, Search, Filter, ChevronDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { ChevronLeft, ChevronRight, Trash2, AlertTriangle, Link as LinkIcon, Menu, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";

const DraggableLinkCard = ({ link, removeLocalLink, updateLocalLink, search }: any) => {
  const controls = useDragControls();
  
  return (
    <Reorder.Item value={link} dragListener={false} dragControls={controls} className="flex gap-3 relative w-full min-w-0 select-none">
      <div 
        className="flex flex-col justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500 px-1 transition-colors touch-none"
        onPointerDown={(e) => controls.start(e)}
        title="Drag to reorder"
      >
        <Menu className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <LinkCard 
          link={link} 
          onDelete={removeLocalLink}
          onEdit={updateLocalLink}
          searchTerm={search}
        />
      </div>
    </Reorder.Item>
  );
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const { localLinks, removeLocalLink, updateLocalLink, clearLocalLinks, historyOrder, setHistoryOrder, resetHistoryOrder } = useLinkStore();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '15days', label: 'Last 15 Days' },
    { value: '30days', label: 'Last 30 Days' },
  ];

  const handleDeleteAll = async () => {
    setIsDeleteAllModalOpen(false);
    setDeletingAll(true);
    try {
      if (status === "authenticated") {
        const res = await fetch("/api/links/delete-all", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete from database");
      }
      clearLocalLinks();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingAll(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter, itemsPerPage]);

  const filteredLinks = useMemo(() => {
    let result = localLinks.filter((link) => {
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

    if (historyOrder.length > 0) {
      result.sort((a, b) => {
         const indexA = historyOrder.indexOf(a.id);
         const indexB = historyOrder.indexOf(b.id);
         if (indexA !== -1 && indexB !== -1) return indexA - indexB;
         if (indexA !== -1) return -1;
         if (indexB !== -1) return 1;
         return a.createdAt - b.createdAt; // Ascending
      });
    } else {
      result.sort((a, b) => a.createdAt - b.createdAt); // Ascending
    }
    
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return result;
  }, [localLinks, search, dateFilter, historyOrder]);

  const pinnedLinks = useMemo(() => filteredLinks.filter(l => l.isPinned), [filteredLinks]);
  const unpinnedLinks = useMemo(() => filteredLinks.filter(l => !l.isPinned), [filteredLinks]);

  const totalPages = Math.max(1, Math.ceil(unpinnedLinks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUnpinned = unpinnedLinks.slice(startIndex, startIndex + itemsPerPage);
  
  const displayLinks = [...pinnedLinks, ...paginatedUnpinned];

  const handleReorder = (newDisplayLinks: any[]) => {
    const newPinned = newDisplayLinks.filter(l => l.isPinned);
    const newUnpinned = newDisplayLinks.filter(l => !l.isPinned);
    
    const globalUnpinned = [...unpinnedLinks];
    globalUnpinned.splice(startIndex, itemsPerPage, ...newUnpinned);
    
    const newHistoryOrder = [...newPinned, ...globalUnpinned].map(l => l.id);
    setHistoryOrder(newHistoryOrder);

    if (status === "authenticated") {
       fetch("/api/user/history-order", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ historyOrder: newHistoryOrder })
       }).catch(console.error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <BackgroundEffects />
      <div className="w-full max-w-4xl mx-auto space-y-8 mt-4 sm:mt-8 z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl relative z-50">
          <div className="flex items-center gap-4 shrink-0">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center tracking-tight whitespace-nowrap">
              <History className="w-8 h-8 mr-3 text-indigo-500 dark:text-cyan-400 shrink-0" />
              History
            </h1>
          </div>
          
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/10 dark:bg-black/40 border border-white/10 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex flex-row items-center gap-3 w-full lg:w-auto lg:flex-nowrap shrink-0">
            <div className="relative flex-1 sm:w-36 sm:flex-none z-50">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="w-full flex items-center justify-between pl-10 pr-4 py-2 bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none transition-all"
              >
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <span className="truncate">{filterOptions.find(o => o.value === dateFilter)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[100]"
                  >
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateFilter(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          dateFilter === option.value 
                            ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white font-medium' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {localLinks.length > 0 && (
                 <button 
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    disabled={deletingAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 w-full sm:w-auto"
                 >
                    <Trash2 className="w-4 h-4" />
                    {deletingAll ? "Clearing..." : "Clear All"}
                 </button>
            )}
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
            {historyOrder.length > 0 && (
              <div className="flex justify-end -mb-2">
                <button 
                  onClick={() => setIsResetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Reset custom sorting"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            )}
            <Reorder.Group axis="y" values={displayLinks} onReorder={handleReorder} className="grid gap-4 w-full min-w-0">
              {displayLinks.map((link) => (
                <DraggableLinkCard 
                  key={link.id} 
                  link={link} 
                  removeLocalLink={removeLocalLink}
                  updateLocalLink={updateLocalLink}
                  search={search}
                />
              ))}
            </Reorder.Group>

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

      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete All Links</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Are you sure you want to delete all your saved links? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteAllModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResetModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
                  <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reset Sorting</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Are you sure you want to revert to the default chronological sorting? This will remove your custom arrangement.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetHistoryOrder();
                      setIsResetModalOpen(false);
                      if (status === "authenticated") {
                         fetch("/api/user/history-order", {
                           method: "PUT",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ historyOrder: [] })
                         }).catch(console.error);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Reset Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
