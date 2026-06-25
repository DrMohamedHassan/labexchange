"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function BuyerContactBox({
  whatsappLink,
  isSold,
  listingId,
  country,
}: {
  whatsappLink: string;
  isSold: boolean;
  listingId: number;
  country?: string | null;
}) {
  const [accepted, setAccepted] = useState(false);

  async function trackWhatsAppClick() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("analytics_events").insert({
        event_type: "whatsapp_click",
        page_path: window.location.pathname,
        listing_id: listingId,
        user_id: user?.id || null,
        metadata: {
          source: "listing_details_contact_button",
          country: country || null,
        },
      });
    } catch (error) {
      console.error("WhatsApp analytics tracking failed:", error);
    }
  }

  if (isSold) {
    return (
      <div
        id="buyer-contact"
        className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800"
      >
        <p className="font-black">This product has been marked as sold.</p>

        <p className="mt-2 text-sm leading-6">
          This advertisement is kept temporarily for transparency and buyer
          review.
        </p>
      </div>
    );
  }

  if (!whatsappLink) {
    return (
      <div
        id="buyer-contact"
        className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5"
      >
        <h2 className="font-black text-slate-900">Seller contact unavailable</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          The seller did not provide a valid WhatsApp number for this listing.
          Please report this listing or contact LabFinds admin if you need help.
        </p>

        <Link
          href="/contact"
          className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
        >
          Contact Admin
        </Link>
      </div>
    );
  }

  return (
    <div
      id="buyer-contact"
      className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5"
    >
      <h2 className="font-black text-amber-900">Buyer safety advice</h2>

      <p className="mt-3 text-sm leading-6 text-amber-900">
        For your safety, it is better to meet the seller in a trusted and safe
        place, such as a research center, laboratory, university, or official
        workplace. Check the product condition, expiry, storage, documents, and
        seller identity before payment.
      </p>

      <label className="mt-5 flex gap-3 text-sm leading-6 text-amber-950">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1"
        />

        <span>
          I understand that LabFinds is only a platform and intermediary. I am
          responsible for checking the product, seller identity, documents,
          storage, and completing the transaction safely.{" "}
          <Link href="/policies" className="font-bold underline">
            Read policies
          </Link>
        </span>
      </label>

      {accepted ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          onClick={trackWhatsAppClick}
          className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800"
        >
          Continue to WhatsApp
        </a>
      ) : (
        <span className="mt-6 inline-block cursor-not-allowed rounded-2xl bg-slate-300 px-6 py-4 font-black text-slate-600">
          Accept safety terms first
        </span>
      )}
    </div>
  );
}