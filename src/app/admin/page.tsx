"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ListingStatus = "pending" | "approved" | "rejected" | "sold";

type AdminListing = {
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
  seller_name: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  status: ListingStatus;
  image_url: string | null;
  product_image_url: string | null;
  voucher_image_url: string | null;
  proof_image_url: string | null;
  admin_feedback: string | null;
  seller_marked_sold_at: string | null;
  sold_expires_at: string | null;
};

export default function AdminPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [message, setMessage] = useState("Loading admin dashboard...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    async function loadAdminData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please login first.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setMessage("Profile not found.");
        return;
      }

      if (profile.role !== "admin") {
        setMessage("You are logged in, but you are not an admin.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, brand, quantity, category, condition, city, price, expiry_date, storage_condition, seller_name, seller_phone, seller_email, status, image_url, product_image_url, voucher_image_url, proof_image_url, admin_feedback, seller_marked_sold_at, sold_expires_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setListings((data || []) as AdminListing[]);
      setMessage("");
    }

    loadAdminData();
  }, []);

  async function updateListingStatus(
    listingId: number,
    newStatus: ListingStatus
  ) {
    setMessage("Updating listing...");

    const listing = listings.find((item) => item.id === listingId);
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 20);

    const updateData: {
      status: ListingStatus;
      admin_feedback?: string | null;
      seller_marked_sold_at?: string | null;
      sold_expires_at?: string | null;
    } = {
      status: newStatus,
    };

    if (newStatus === "rejected") {
      const feedback = (feedbackDrafts[listingId] || "").trim();

      if (feedback.length < 5) {
        setMessage("Please write a rejection comment before rejecting.");
        return;
      }

      updateData.admin_feedback = feedback;
      updateData.seller_marked_sold_at = null;
      updateData.sold_expires_at = null;
    }

    if (newStatus === "approved") {
      updateData.admin_feedback = null;
      updateData.seller_marked_sold_at = null;
      updateData.sold_expires_at = null;
    }

    if (newStatus === "sold") {
      updateData.admin_feedback = null;
      updateData.seller_marked_sold_at =
        listing?.seller_marked_sold_at || now.toISOString();
      updateData.sold_expires_at = listing?.sold_expires_at || expiresAt.toISOString();
    }

    const { error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", listingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === listingId
          ? {
              ...item,
              ...updateData,
            }
          : item
      )
    );

    setMessage(`Listing marked as ${newStatus}.`);
  }

  async function deleteListing(listingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setMessage("Deleting listing...");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== listingId)
    );

    setMessage("Listing deleted.");
  }

  function isSoldExpired(listing: AdminListing) {
    if (listing.status !== "sold") return false;
    if (!listing.sold_expires_at) return false;

    return new Date(listing.sold_expires_at) <= new Date();
  }

  function getEmailLink(listing: AdminListing) {
    if (!listing.seller_email) return "#";

    const feedback =
      listing.admin_feedback || feedbackDrafts[listing.id] || "";

    const subject = encodeURIComponent(
      `LabExchange listing feedback: ${listing.title}`
    );

    const body = encodeURIComponent(
      `Hello ${listing.seller_name || "Seller"},\n\nYour listing "${listing.title}" needs changes before approval.\n\nAdmin feedback:\n${feedback}\n\nPlease edit your listing and resubmit it for review.\n\nRegards,\nLabExchange Admin`
    );

    return `mailto:${listing.seller_email}?subject=${subject}&body=${body}`;
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

  const expiredSoldListings = listings.filter(isSoldExpired);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Admin Dashboard</h1>

            <p className="mt-4 rounded-2xl bg-slate-100 p-4 font-semibold text-slate-700">
              {message}
            </p>

            <a
              href="/login"
              className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white"
            >
              Go to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black">Admin Dashboard</h1>

          <p className="mt-3 text-slate-600">
            Review listings, approve or reject ads, add feedback, monitor sold
            ads, and delete expired sold listings after review.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <StatCard label="Total" value={totalListings} />
          <StatCard label="Approved" value={approvedListings} />
          <StatCard label="Pending" value={pendingListings} />
          <StatCard label="Rejected" value={rejectedListings} />
          <StatCard label="Sold" value={soldListings} />
        </div>

        {expiredSoldListings.length > 0 && (
          <div className="mt-6 rounded-3xl bg-red-50 p-5 text-red-800">
            <h2 className="text-xl font-black">Sold listing reminder</h2>

            <p className="mt-2 text-sm leading-6">
              {expiredSoldListings.length} sold listing(s) reached the 20-day
              visibility period. Please review and delete if appropriate.
            </p>
          </div>
        )}

        {message && (
          <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-semibold text-slate-700">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-5">
          {listings.map((listing) => {
            const expired = isSoldExpired(listing);

            return (
              <div
                key={listing.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black">{listing.title}</h2>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize">
                        {listing.status}
                      </span>

                      {expired && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                          Sold visibility expired
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                      <InfoItem label="Brand" value={listing.brand || "-"} />
                      <InfoItem label="Qty" value={listing.quantity || "-"} />
                      <InfoItem label="Category" value={listing.category} />
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
                      <InfoItem
                        label="Seller"
                        value={listing.seller_name || "-"}
                      />
                      <InfoItem
                        label="Phone"
                        value={listing.seller_phone || "-"}
                      />
                      <InfoItem
                        label="Email"
                        value={listing.seller_email || "-"}
                      />
                      <InfoItem
                        label="Sold expires"
                        value={listing.sold_expires_at || "-"}
                      />
                    </div>

                    {listing.admin_feedback && (
                      <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
                        <p className="font-black">Saved admin feedback</p>
                        <p className="mt-2">{listing.admin_feedback}</p>
                      </div>
                    )}

                    <div className="mt-5">
                      <label className="mb-2 block font-black">
                        Rejection comment / seller feedback
                      </label>

                      <textarea
                        rows={3}
                        placeholder="Example: Please upload a clearer real product image and add expiry/storage details."
                        value={feedbackDrafts[listing.id] || ""}
                        onChange={(event) =>
                          setFeedbackDrafts((current) => ({
                            ...current,
                            [listing.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 content-start">
                    <button
                      type="button"
                      onClick={() =>
                        updateListingStatus(listing.id, "approved")
                      }
                      className="rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateListingStatus(listing.id, "rejected")
                      }
                      className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                    >
                      Reject with Feedback
                    </button>

                    <button
                      type="button"
                      onClick={() => updateListingStatus(listing.id, "sold")}
                      className="rounded-2xl bg-slate-800 px-4 py-3 font-bold text-white hover:bg-slate-900"
                    >
                      Mark Sold
                    </button>

                    {listing.seller_email && (
                      <a
                        href={getEmailLink(listing)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-bold hover:border-emerald-600"
                      >
                        Email Seller Feedback
                      </a>
                    )}

                    {expired && (
                      <button
                        type="button"
                        onClick={() => deleteListing(listing.id)}
                        className="rounded-2xl bg-black px-4 py-3 font-bold text-white hover:bg-slate-800"
                      >
                        Delete Expired Sold Listing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {listings.length === 0 && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              No listings found.
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
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black">{value}</p>
    </div>
  );
}