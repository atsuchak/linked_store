"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function SessionGuardian() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("SessionGuardian check:", { session, status });
    if (session?.error === "InvalidSession" || (status === "unauthenticated" && window.location.pathname !== "/auth" && window.location.pathname !== "/")) {
      console.log("Invalid session detected. Signing out...");
      if (window.location.pathname !== "/auth") {
        signOut({ callbackUrl: "/auth" });
      }
    }
  }, [session, status]);

  return null;
}
