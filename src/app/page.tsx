import { BackgroundEffects } from "@/components/BackgroundEffects";
import { LinkInputForm } from "@/components/LinkInputForm";
import { RecentLinks } from "@/components/RecentLinks";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      <BackgroundEffects />
      
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 sm:gap-12 z-10 my-auto pb-8 sm:pb-12 pt-4 sm:pt-8 flex-grow">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-400 bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 mb-2">
            Welcome to Link Base
          </div>
          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 pb-2 px-2">
            Save Everything. Organize Anything.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto px-4">
            Store, manage, and find your important links instantly.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <LinkInputForm />
        </div>

        <div className="w-full max-w-4xl mt-4">
          <RecentLinks />
        </div>
      </div>
    </div>
  );
}
