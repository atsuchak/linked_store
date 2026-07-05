"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { SyncLinks } from "./SyncLinks";
import { SessionGuardian } from "./SessionGuardian";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={10}>
      <SessionGuardian />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SyncLinks />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
