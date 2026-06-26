"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPriceWithCurrency } from "@/lib/currencies";
import { supabase } from "@/lib/supabase";

type SellerPublicProfile = {
  full_name: string | null;
  organization: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean | null;
};

export default function ListingCard({
  id,
  title,
  category,
  condition,
  city,
  price,
  priceCurrency,
  imageUrl,
  status,
  sellerId,
  sellerPhone,
}: {
  id: number;
  title: string;
  category: string;
  condition: string;
  city: string;
  price: number | string | null;
  priceCurrency?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  sellerId?: string | null;
  sellerPhone?: string | null;
}) {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] =
    useState<SellerPublicProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const isSold = status === "sold";

  const canEdit = Boolean(
    currentUserId && sellerId && currentUserId === sellerId
  );

  const canDelete = Boolean(
    currentRole === "admin" ||
      (currentUserId && sellerId && currentUserId === sellerId)
  );

  useEffect(() => {
    let mounted = true;

    async function loadUserAndSeller() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (mounted && user) {
          setCurrentUserId(user.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (mounted) {
            setCurrentRole(profile?.role || "seller");
          }
        }

        if (sellerId) {
          const { data: publicProfile } = await supabase
            .from("public_profiles")
            .select("full_name, organization, avatar_url, is_verified_seller")
            .eq("id", sellerId)
            .maybeSingle();

          if (mounted) {
            setSellerProfile(publicProfile as SellerPublicProfile | null);
          }
        }
      } catch (error) {
        console.error("ListingCard loading failed:", error);
      }
    }

    loadUserAndSeller();

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  async function deleteListing() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setMessage("Deleting...");

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      setIsDeleting(false);
      return;
    }

    setMessage("Deleted successfully.");
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
      {canDelete && (
        <div className="absolute right-3 top-3 z-20">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full bg-white/95 px-3 py-1 text-xl font-black text-slate-700 shadow-sm hover:bg-slate-100"
            aria-label="Listing actions"
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              {canEdit && (
                <Link
                  href={`/listings/${id}/edit`}
                  className="block rounded-xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Edit listing
                </Link>
              )}

              <button
                type="button"
                onClick={deleteListing}
                disabled={isDeleting}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isDeleting ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          )}
        </div>
      )}

      <Link href={`/listings/${id}`} className="block">
        <div className="relative h-56 bg-slate-100">
          <img
            src={imageUrl || "/images/product-placeholder.png"}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
            {condition}
          </span>

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950">
                Sold
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {sellerId && (
          <Link
            href={`/users/${sellerId}`}
            className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-emerald-50"
          >
            {sellerProfile?.avatar_url ? (
              <img
                src={sellerProfile.avatar_url}
                alt={sellerProfile.full_name || "Seller"}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl ring-1 ring-slate-200">
                👤
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">
                {sellerProfile?.full_name || "View seller profile"}
              </p>

              <p className="text-xs font-bold text-slate-500">
                {sellerProfile?.is_verified_seller
                  ? "✅ Verified User"
                  : "Seller profile"}
              </p>
            </div>
          </Link>
        )}

        <Link href={`/listings/${id}`} className="block">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            {category}
          </p>

          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-950">
            {title}
          </h3>

          <p className="mt-3 text-sm font-bold text-slate-500">{city}</p>

          <p className="mt-4 text-xl font-black text-slate-950">
            {formatPriceWithCurrency(price, priceCurrency)}
          </p>
        </Link>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/listings/${id}`}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-800 hover:border-emerald-600"
          >
            Details
          </Link>

          {!isSold && sellerPhone && (
            <Link
              href={`/listings/${id}#buyer-contact`}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white hover:bg-emerald-800"
            >
              Buy
            </Link>
          )}
        </div>

        {message && (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}