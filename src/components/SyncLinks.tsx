"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLinkStore } from "@/store/linkStore";

export function SyncLinks() {
  const { status } = useSession();
  const { setLocalLinks } = useLinkStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !hasSynced.current) {
      hasSynced.current = true;
      
      const performSync = async () => {
        try {
          const currentLinks = useLinkStore.getState().localLinks;
          // Local links added while logged out have a UUID (length 36, contains hyphens)
          // MongoDB ObjectIds are 24-character hex strings.
          const unsyncedLinks = currentLinks.filter(
            (link) => link.id.includes('-') || link.id.length !== 24
          );

          if (unsyncedLinks.length > 0) {
            await fetch("/api/links/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ links: unsyncedLinks }),
            });
          }

          // Fetch the updated list of links from the database
          const res = await fetch("/api/links", { cache: "no-store", next: { revalidate: 0 } });
          if (!res.ok) throw new Error("Failed to fetch links");
          
          const data = await res.json();
          setLocalLinks(data);

          const historyRes = await fetch("/api/user/history-order", { cache: "no-store", next: { revalidate: 0 } });
          if (historyRes.ok) {
             const historyData = await historyRes.json();
             const localHistoryOrder = useLinkStore.getState().historyOrder;
             
             if (historyData.historyOrder && historyData.historyOrder.length > 0) {
               useLinkStore.getState().setHistoryOrder(historyData.historyOrder);
             } else if (localHistoryOrder && localHistoryOrder.length > 0) {
               // Push local to DB if DB is empty but local is not
               fetch("/api/user/history-order", {
                 method: "PUT",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ historyOrder: localHistoryOrder })
               }).catch(console.error);
             }
          }
        } catch (error) {
          console.error("Sync error:", error);
        }
      };

      performSync();
    }
  }, [status, setLocalLinks]);

  return null;
}
