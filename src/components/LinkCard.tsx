"use client";

import { ExternalLink, Copy, CheckCircle2, Trash2, Edit2, Check, X, Maximize2 } from "lucide-react";
import { useState } from "react";
import { LocalLink } from "@/store/linkStore";
import { motion, AnimatePresence } from "framer-motion";

interface LinkCardProps {
  link: LocalLink | any;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updatedLink: Partial<LocalLink>) => void;
  searchTerm?: string;
}

export function LinkCard({ link, onDelete, onEdit, searchTerm }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editTitle, setEditTitle] = useState(link.title || "");
  const [editDesc, setEditDesc] = useState(link.description || "");

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`/api/links/${link.id || link._id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
    if (onDelete) onDelete(link.id || link._id);
    setIsDeleteModalOpen(false);
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsModalOpen(false); // Close modal if open when starting edit
  };

  const handleSave = async () => {
    let formattedUrl = editUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      await fetch(`/api/links/${link.id || link._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl, title: editTitle, description: editDesc }),
      });
    } catch (err) {
      console.error(err);
    }

    if (onEdit) {
      onEdit(link.id || link._id, { url: formattedUrl, title: editTitle, description: editDesc });
    }
    setIsEditing(false);
  };

  const formattedDate = new Date(link.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight || !highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-500/50 text-slate-900 dark:text-white rounded-sm px-0.5">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  if (isEditing) {
    return (
      <div className="group bg-white/5 dark:bg-black/20 backdrop-blur-md border border-indigo-500/50 rounded-xl p-5 shadow-lg flex flex-col gap-3 z-10 relative">
        <input
          type="text"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          placeholder="URL"
        />
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          placeholder="Title (Optional)"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-100"
          placeholder="Description (Optional)"
          rows={2}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md">
            <X className="w-4 h-4" />
          </button>
          <button onClick={handleSave} className="p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-md">
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-xl p-5 shadow-lg hover:border-indigo-500/30 transition-all flex flex-col relative overflow-hidden cursor-pointer"
      >
        <div className="flex-1 min-w-0 z-10 pointer-events-none w-full flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4 mb-2 pointer-events-auto">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate pointer-events-none">
              {highlightText(link.title || link.url.replace(/^https?:\/\/(www\.)?/, ""), searchTerm)}
            </h3>
            
            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                title="Copy URL"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {onEdit && (
                <button
                  onClick={handleEditStart}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                  title="Edit Link"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                  title="Delete Link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          
          {link.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 pointer-events-none">
              {highlightText(link.description, searchTerm)}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-auto pointer-events-auto w-full">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-indigo-500 dark:text-cyan-400 hover:underline flex items-center truncate min-w-0 pr-4"
            >
              <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{highlightText(link.url, searchTerm)}</span>
            </a>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">{formattedDate}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-black/5 dark:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white pr-8 mb-2">
                  {highlightText(link.title || link.url.replace(/^https?:\/\/(www\.)?/, ""), searchTerm)}
                </h2>
                
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <span className="font-medium text-indigo-500 dark:text-cyan-400">{formattedDate}</span>
                </div>

                {link.description && (
                  <div className="bg-slate-50 dark:bg-black/30 rounded-xl p-4 mb-6 border border-slate-100 dark:border-white/5">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed break-words">
                      {highlightText(link.description, searchTerm)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex justify-center items-center py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Link
                  </a>
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 sm:flex-none flex items-center justify-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </button>
                    {onEdit && (
                      <button
                        onClick={handleEditStart}
                        className="p-2.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-cyan-400 bg-slate-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors border border-slate-200 dark:border-white/10"
                        title="Edit Link"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={handleDeleteClick}
                        className="p-2.5 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors border border-slate-200 dark:border-white/10"
                        title="Delete Link"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] p-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Link</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  Are you sure you want to delete this link? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
