"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLinkStore } from "@/store/linkStore";

export function SyncLinks() {
  const { status } = useSession();
  const { setLocalLinks } = useLinkStore();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/links", { cache: "no-store", next: { revalidate: 0 } })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch links");
        })
        .then((data) => {
          setLocalLinks(data);
        })
        .catch(console.error);
    }
  }, [status, setLocalLinks]);

  return null;
}
