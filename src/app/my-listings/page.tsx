"use client";

import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ListingStatus = "pending" | "approved" | "rejected" | "sold";

type SellerListing = {
  id: number;
  title: string;
  brand: string | null;
  quantity: string | null;
  category: string;
  condition: string;
  city: string;
  price: number;
  expiry_date: string | null;
  storage_condition: string | null;
  status: ListingStatus;
  image_url: string | null;
  product_image_url: string | null;
  voucher_image_url: string | null;
  proof_image_url: string | null;
  admin_feedback: string | null;
  seller_marked_sold_at: string | null;
  sold_expires_at: string | null;
};

export default function MyListingsPage() {
  const router = useRouter();

  const [listings, setListings] = useState<SellerListing[]>([]);
  const [message, setMessage] = useState("Loading your listings...");
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function loadMyListings() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please login first to view your listings. Redirecting...");
        setIsAllowed(false);
        setIsCheckingUser(false);

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      setIsAllowed(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, brand, quantity, category, condition, city, price, expiry_date, storage_condition, status, image_url, product_image_url, voucher_image_url, proof_image_url, admin_feedback, seller_marked_sold_at, sold_expires_at"
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setIsCheckingUser(false);
        return;
      }

      setListings((data || []) as SellerListing[]);
      setMessage("");
      setIsCheckingUser(false);
    }

    loadMyListings();
  }, [router]);

  async function markAsSold(listingId: number) {
    setMessage("Marking listing as sold...");

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 20);

    const { error } = await supabase
      .from("listings")
      .update({
        status: "sold",
        seller_marked_sold_at: now.toISOString(),
        sold_expires_at: expiresAt.toISOString(),
      })
      .eq("id", listingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "sold",
              seller_marked_sold_at: now.toISOString(),
              sold_expires_at: expiresAt.toISOString(),
            }
          : listing
      )
    );

    setMessage(
      "Listing marked as sold. It will remain visible for 20 days, then admin can remove it."
    );
  }

  async function markAsAvailable(listingId: number) {
    setMessage("Marking listing as available...");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "approved",
        seller_marked_sold_at: null,
        sold_expires_at: null,
      })
      .eq("id", listingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "approved",
              seller_marked_sold_at: null,
              sold_expires_at: null,
            }
          : listing
      )
    );

    setMessage("Listing marked as still available.");
  }

  const totalListings = listings.length;
  const approvedListings = listings.filter(
    (listing) => listing.status === "approved"
  ).length;
  const pendingListings = listings.filter(
    (listing) => listing.status === "pending"
  ).length;
  const rejectedListings = listings.filter(
    (listing) => listing.status === "rejected"
  ).length;
  const soldListings = listings.filter(
    (listing) => listing.status === "sold"
  ).length;

  if (isCheckingUser) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <PageCard
          title="Checking your account..."
          text="Please wait while we check your login session."
        />
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <PageCard title="Login required" text={message} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black">My Listings</h1>

            <p className="mt-3 text-slate-600">
              Track your submitted lab products, edit listings, and mark items
              as sold or still available.
            </p>
          </div>

          <Link
            href="/add-listing"
            className="rounded-2xl bg-emerald-700 px-6 py-4 text-center font-bold text-white hover:bg-emerald-800"
          >
            + Add New Listing
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <StatCard label="Total" value={totalListings} />
          <StatCard label="Approved" value={approvedListings} />
          <StatCard label="Pending" value={pendingListings} />
          <StatCard label="Rejected" value={rejectedListings} />
          <StatCard label="Sold" value={soldListings} />
        </div>

        {message && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-slate-700 shadow-sm">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const productImage =
              listing.product_image_url ||
              listing.image_url ||
              "/images/product-placeholder.png";

            const isSold = listing.status === "sold";

            return (
              <div
                key={listing.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="relative h-52 bg-slate-100">
                  <Image
                    src={productImage}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-black capitalize text-white">
                    {listing.status}
                  </span>

                  {isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                      <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950">
                        Sold
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-sm font-bold text-emerald-700">
                    {listing.category}
                  </p>

                  <h2 className="mt-2 text-xl font-black">{listing.title}</h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {listing.brand || "No brand"} ·{" "}
                    {listing.quantity || "No quantity"}
                  </p>

                  {listing.status === "rejected" && listing.admin_feedback && (
                    <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
                      <p className="font-black">Admin feedback</p>
                      <p className="mt-2">{listing.admin_feedback}</p>
                    </div>
                  )}

                  {listing.status === "pending" && (
                    <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      Your listing is waiting for admin review.
                    </div>
                  )}

                  {listing.status === "sold" && (
                    <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
                      This listing is marked as sold. It remains visible for 20
                      days from the sold date, then admin can remove it.
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <InfoItem label="Condition" value={listing.condition} />
                    <InfoItem label="City" value={listing.city} />
                    <InfoItem
                      label="Price"
                      value={`${Number(listing.price).toLocaleString()} EGP`}
                    />
                    <InfoItem
                      label="Expiry"
                      value={listing.expiry_date || "N/A"}
                    />
                    <InfoItem
                      label="Storage"
                      value={listing.storage_condition || "-"}
                    />
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-center font-bold hover:border-emerald-600"
                    >
                      Edit Listing
                    </Link>

                    {listing.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => markAsSold(listing.id)}
                        className="rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
                      >
                        Mark as Sold
                      </button>
                    )}

                    {listing.status === "sold" && (
                      <button
                        type="button"
                        onClick={() => markAsAvailable(listing.id)}
                        className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                      >
                        Still Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {listings.length === 0 && !message && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black">No listings yet</h2>

              <p className="mt-3 text-slate-600">
                You have not submitted any listings yet.
              </p>

              <Link
                href="/add-listing"
                className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white"
              >
                Add Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950">{value}</span>
    </div>
  );
}

function PageCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-4 text-slate-600">{text}</p>
      </div>
    </div>
  );
}