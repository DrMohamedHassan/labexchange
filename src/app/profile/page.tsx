"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPriceWithCurrency } from "@/lib/currencies";

type OwnListing = {
  id: number;
  title: string | null;
  status: string | null;
  category: string | null;
  country: string | null;
  city: string | null;
  price: number | string | null;
  price_currency: string | null;
  product_image_url: string | null;
  image_url: string | null;
};

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("not_requested");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [listings, setListings] = useState<OwnListing[]>([]);
  const [message, setMessage] = useState("Loading profile...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first to view your profile.");
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "email, full_name, organization, country, avatar_url, is_verified_seller, verification_status"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || null,
        role: "seller",
        full_name: user.email ? user.email.split("@")[0] : null,
      });
    }

    setFullName(profile?.full_name || "");
    setOrganization(profile?.organization || "");
    setCountry(profile?.country || "");
    setAvatarUrl(profile?.avatar_url || "");
    setIsVerifiedSeller(Boolean(profile?.is_verified_seller));
    setVerificationStatus(profile?.verification_status || "not_requested");

    const { data: ownListings } = await supabase
      .from("listings")
      .select(
        "id, title, status, category, country, city, price, price_currency, product_image_url, image_url"
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    setListings((ownListings || []) as OwnListing[]);
    setMessage("");
  }

  async function uploadAvatar(file: File, currentUserId: string) {
    const extension = file.name.split(".").pop();
    const filePath = `${currentUserId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    setIsSaving(true);
    setMessage("Saving profile...");

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile, userId);
      }

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        role: "seller",
        full_name: fullName.trim() || null,
        organization: organization.trim() || null,
        country: country.trim() || null,
        avatar_url: finalAvatarUrl || null,
      });

      if (error) {
        setMessage(error.message);
        setIsSaving(false);
        return;
      }

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setMessage("Profile updated successfully.");
      setIsSaving(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-black">My Profile</h1>

            <p className="mt-3 leading-7 text-slate-600">
              This page is private. Your email is visible only to you and admin.
              Public visitors can only see your display name, avatar,
              verification badge, approved listings, and approved reviews.
            </p>

            <div className="mt-8 flex items-center gap-5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-50"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-4xl ring-4 ring-emerald-100">
                  👤
                </div>
              )}

              <div>
                <p className="text-xl font-black">
                  {fullName || "No display name yet"}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  {email}
                </p>

                {isVerifiedSeller ? (
                  <span className="mt-3 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
                    ✅ Verified User
                  </span>
                ) : (
                  <Link
                    href="/verify-seller"
                    className="mt-3 inline-block rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 ring-1 ring-amber-200"
                  >
                    🛡️ Not verified — verify now
                  </Link>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-8 grid gap-5">
              <InputField
                label="Display Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Your public display name"
              />

              <InputField
                label="Organization / Lab / Company"
                value={organization}
                onChange={setOrganization}
                placeholder="Example: Cairo University Lab"
              />

              <InputField
                label="Country"
                value={country}
                onChange={setCountry}
                placeholder="Example: Egypt"
              />

              <div>
                <label className="mb-2 block font-bold">Profile Image</label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setAvatarFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-black">Private email</p>

                <p className="mt-2 text-slate-600">{email}</p>

                <p className="mt-2 text-sm text-slate-500">
                  Your email is not shown on your public seller profile.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-black">Verification status</p>

                <p className="mt-2 capitalize text-slate-600">
                  {verificationStatus.replace("_", " ")}
                </p>

                {!isVerifiedSeller && (
                  <Link
                    href="/verify-seller"
                    className="mt-4 inline-block font-black text-emerald-700 underline"
                  >
                    Submit verification request
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {message && (
              <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
                {message}
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black">My Listings</h2>

            <p className="mt-3 leading-7 text-slate-600">
              These are your own listings. Approved listings are public. Pending
              listings need admin review.
            </p>

            <div className="mt-6 grid gap-4">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[120px_1fr]"
                  >
                    <img
                      src={
                        listing.product_image_url ||
                        listing.image_url ||
                        "/images/product-placeholder.png"
                      }
                      alt={listing.title || "Listing"}
                      className="h-28 w-full rounded-2xl object-cover"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black">
                          {listing.title || "Untitled listing"}
                        </h3>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-600 ring-1 ring-slate-200">
                          {listing.status || "pending"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-emerald-700">
                        {listing.category || "General"} ·{" "}
                        {listing.country || "Country not set"}
                      </p>

                      <p className="mt-2 font-black">
                        {formatPriceWithCurrency(
                          listing.price,
                          listing.price_currency
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {listing.status === "approved" && (
                          <Link
                            href={`/listings/${listing.id}`}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black hover:border-emerald-600"
                          >
                            Public details
                          </Link>
                        )}

                        <Link
                          href={`/listings/${listing.id}/edit`}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white hover:bg-emerald-800"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h3 className="text-xl font-black">No listings yet</h3>

                  <p className="mt-2 text-slate-600">
                    Add your first listing and send it to admin review.
                  </p>

                  <Link
                    href="/add-listing"
                    className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
                  >
                    Add Listing
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}