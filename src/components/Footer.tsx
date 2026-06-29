import Link from 'next/link';
import { Globe } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-slate-200 dark:border-white/10 bg-transparent mt-auto relative z-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="hidden sm:block flex-1"></div>
        <div className="text-sm text-slate-500 dark:text-slate-400 flex-1 text-center font-medium whitespace-nowrap">
          &copy; 2026 All rights reserved. ahnaf tajwar suchak
        </div>
        <div className="flex items-center sm:justify-end justify-center space-x-5 flex-1">
          <Link href="https://linkedin.com/in/atsuchak" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors">
            <LinkedinIcon className="w-5 h-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="https://atsuchak.me" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors">
            <Globe className="w-5 h-5" />
            <span className="sr-only">Portfolio</span>
          </Link>
          <Link href="https://github.com/atsuchak" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-colors">
            <GithubIcon className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
