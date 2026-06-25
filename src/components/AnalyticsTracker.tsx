"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function trackPageVisit() {
      if (!pathname) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("analytics_events").insert({
        event_type: "page_visit",
        page_path: pathname,
        user_id: user?.id || null,
        metadata: {
          title: document.title,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        },
      });
    }

    trackPageVisit();
  }, [pathname]);

  return null;
}