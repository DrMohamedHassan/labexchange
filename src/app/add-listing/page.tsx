"use client";

import Header from "@/components/Header";
import {
  CONDITION_OPTIONS,
  DEFAULT_CONDITION,
  DEFAULT_LISTING_CATEGORY,
  LISTING_CATEGORIES,
} from "@/lib/listing-options";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddListingPage() {
  const router = useRouter();

  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState(DEFAULT_LISTING_CATEGORY);
  const [condition, setCondition] = useState(DEFAULT_CONDITION);
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageCondition, setStorageCondition] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [voucherImageFile, setVoucherImageFile] = useState<File | null>(null);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);

  const [usedVerificationAcknowledged, setUsedVerificationAcknowledged] =
    useState(false);
  const [usedVerificationNotes, setUsedVerificationNotes] = useState("");

  const [acceptedSellerTerms, setAcceptedSellerTerms] = useState(false);
  const [acknowledgedSafety, setAcknowledgedSafety] = useState(false);
  const [acknowledgedProhibited, setAcknowledgedProhibited] = useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUsedProduct = condition.toLowerCase().startsWith("used");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first to add a listing. Redirecting...");
        setIsAllowed(false);
        setIsCheckingUser(false);

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      setIsAllowed(true);
      setIsCheckingUser(false);
    }

    checkUser();
  }, [router]);

  function validateImageFile(file: File | null, required: boolean) {
    if (!file && required) {
      return "Product real image is required. Please upload a real photo of the stored product in your lab or place.";
    }

    if (!file) return null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Invalid image type. Please upload JPG, PNG, or WEBP only.";
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return "Image is too large. Maximum allowed size is 5 MB.";
    }

    return null;
  }

  async function uploadImage(file: File, folder: string, userId: string) {
    const fileError = validateImageFile(file, true);

    if (fileError) {
      throw new Error(fileError);
    }

    const fileExtension = file.name.split(".").pop() || "jpg";
    const safeFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${userId}/${folder}/${safeFileName}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Image upload failed: ${error.message}. Please check that the file is JPG, PNG, or WEBP and less than 5 MB.`
      );
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("Submitting listing...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login first before adding a listing.");
      router.push("/login");
      setIsSubmitting(false);
      return;
    }

    if (!title || !category || !condition || !price || !city || !sellerPhone) {
      setMessage("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setMessage("Please enter a valid price greater than zero.");
      setIsSubmitting(false);
      return;
    }

    if (isUsedProduct && !usedVerificationAcknowledged) {
      setMessage(
        "For used products, please confirm the used product verification declaration."
      );
      setIsSubmitting(false);
      return;
    }

    const productImageError = validateImageFile(productImageFile, true);
    const voucherImageError = validateImageFile(voucherImageFile, false);
    const proofImageError = validateImageFile(proofImageFile, false);

    if (productImageError || voucherImageError || proofImageError) {
      setMessage(productImageError || voucherImageError || proofImageError || "");
      setIsSubmitting(false);
      return;
    }

    if (!acceptedSellerTerms || !acknowledgedSafety || !acknowledgedProhibited) {
      setMessage(
        "Please confirm the seller terms, safety rules, and prohibited items policy before submitting."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const productImageUrl = productImageFile
        ? await uploadImage(productImageFile, "product", user.id)
        : "";

      const voucherImageUrl = voucherImageFile
        ? await uploadImage(voucherImageFile, "voucher", user.id)
        : null;

      const proofImageUrl = proofImageFile
        ? await uploadImage(proofImageFile, "proof", user.id)
        : null;

      const { error } = await supabase.from("listings").insert({
        seller_id: user.id,
        seller_email: user.email ?? null,
        title,
        brand,
        quantity,
        category,
        condition,
        city,
        price: Number(price),
        expiry_date: expiryDate || null,
        storage_condition: storageCondition,
        description,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        image_url: productImageUrl,
        product_image_url: productImageUrl,
        voucher_image_url: voucherImageUrl,
        proof_image_url: proofImageUrl,
        used_verification_acknowledged: isUsedProduct
          ? usedVerificationAcknowledged
          : false,
        used_verification_notes: isUsedProduct ? usedVerificationNotes : null,
        seller_terms_accepted: acceptedSellerTerms,
        safety_acknowledged: acknowledgedSafety,
        prohibited_items_acknowledged: acknowledgedProhibited,
        status: "pending",
      });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setMessage(
        "Listing submitted successfully. It is now pending admin approval."
      );

      setTimeout(() => {
        router.push("/my-listings");
      }, 1200);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again with valid image files."
      );
      setIsSubmitting(false);
    }
  }

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

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Add New Listing</h1>

          <p className="mt-3 text-slate-600">
            Add new, unused, or used lab products. Every listing will be
            reviewed by admin before it appears publicly.
          </p>

          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm leading-6 text-red-800">
            <p className="font-black">Important prohibited items warning</p>

            <p>
              It is not allowed to upload or sell harmful chemicals, hazardous
              materials, restricted medicines, illegal substances, or any product
              requiring special governmental approval.
            </p>

            <p className="mt-2">
              ممنوع إضافة أو بيع أي مواد كيميائية خطرة، مواد ضارة، أدوية
              محظورة، مواد غير قانونية، أو أي منتجات تحتاج إلى ترخيص حكومي خاص.
            </p>
          </div>

          <form onSubmit={handleSubmitListing} className="mt-8 grid gap-5">
            <Input
              label="Listing Title *"
              value={title}
              onChange={setTitle}
              placeholder="Example: qPCR SYBR Green Master Mix"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Brand"
                value={brand}
                onChange={setBrand}
                placeholder="Example: Thermo Fisher"
              />

              <Input
                label="Quantity"
                value={quantity}
                onChange={setQuantity}
                placeholder="Example: 3 boxes / 1 unit / 5 kits"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold">Category *</label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {LISTING_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold">Condition *</label>

                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {CONDITION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isUsedProduct && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                <p className="font-black">Seller Verified Used declaration</p>

                <p className="mt-2">
                  For used products, please confirm that you have checked the
                  product condition honestly. This does not mean LabExchange
                  guarantees the product; it is a seller declaration reviewed by
                  admin for buyer safety.
                </p>

                <p className="mt-2">
                  بالنسبة للمنتجات المستعملة، برجاء تأكيد أنك فحصت حالة المنتج
                  ووصفتها بصدق. هذا لا يعني أن LabExchange يضمن المنتج، لكنه
                  إقرار من البائع يتم مراجعته من الإدارة لزيادة الأمان.
                </p>

                <label className="mt-4 flex gap-3">
                  <input
                    type="checkbox"
                    checked={usedVerificationAcknowledged}
                    onChange={(event) =>
                      setUsedVerificationAcknowledged(event.target.checked)
                    }
                    className="mt-1"
                  />

                  <span className="font-semibold">
                    I confirm that the used product condition is described
                    honestly and accurately.
                  </span>
                </label>

                <textarea
                  rows={4}
                  placeholder="Optional notes: working status, last use, calibration, missing parts, defects, or limitations..."
                  value={usedVerificationNotes}
                  onChange={(event) =>
                    setUsedVerificationNotes(event.target.value)
                  }
                  className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600"
                />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Price *"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="4500"
              />

              <Input
                label="City *"
                value={city}
                onChange={setCity}
                placeholder="Cairo"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Expiry Date"
                type="date"
                value={expiryDate}
                onChange={setExpiryDate}
                placeholder=""
              />

              <div>
                <label className="mb-2 block font-bold">
                  Storage Condition
                </label>

                <select
                  value={storageCondition}
                  onChange={(event) => setStorageCondition(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  <option value="">Select storage condition</option>
                  <option value="Room temperature">Room temperature</option>
                  <option value="2–8°C Refrigerated">2–8°C Refrigerated</option>
                  <option value="-20°C Frozen">-20°C Frozen</option>
                  <option value="-80°C Ultra-low freezer">
                    -80°C Ultra-low freezer
                  </option>
                  <option value="Dry storage">Dry storage</option>
                  <option value="Not applicable">Not applicable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-bold">Description</label>

              <textarea
                rows={5}
                placeholder="Write product details, usage status, expiry, storage, quantity, and important notes..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Seller Name"
                value={sellerName}
                onChange={setSellerName}
                placeholder="Ahmed Lab"
              />

              <Input
                label="WhatsApp Phone *"
                value={sellerPhone}
                onChange={setSellerPhone}
                placeholder="201000000000"
              />
            </div>

            <FileInput
              label="Required product image *"
              description="Upload a real photo of the stored product in your lab/place. Do not use fake images from other websites. ارفع صورة حقيقية للمنتج الموجود عندك في المعمل أو المكان، وليس صورة من مواقع أخرى."
              onChange={setProductImageFile}
            />

            <FileInput
              label="Optional purchase voucher / invoice"
              description="Optional: upload a voucher, invoice, or purchase proof to increase buyer trust. اختياري: يمكنك رفع فاتورة أو إثبات شراء لزيادة مصداقية الإعلان."
              onChange={setVoucherImageFile}
            />

            <FileInput
              label="Optional scientific proof / productivity proof"
              description="Optional: upload any proof that supports product credibility, such as a scientific paper, product certificate, catalog page, or performance proof. اختياري: يمكنك رفع أي إثبات يدعم مصداقية المنتج مثل ورقة علمية أو شهادة أو كتالوج أو دليل أداء."
              onChange={setProofImageFile}
            />

            <Checkbox
              checked={acknowledgedProhibited}
              onChange={setAcknowledgedProhibited}
              text="I confirm this listing does not include harmful chemicals, hazardous materials, restricted medicines, illegal goods, or products requiring special governmental licenses. أؤكد أن هذا الإعلان لا يحتوي على مواد خطرة أو أدوية محظورة أو منتجات غير قانونية أو منتجات تحتاج تراخيص حكومية خاصة."
            />

            <Checkbox
              checked={acknowledgedSafety}
              onChange={setAcknowledgedSafety}
              text="I confirm that product information, condition, images, expiry, and storage details are accurate and not misleading. أؤكد أن بيانات المنتج والحالة والصور وتاريخ الصلاحية والتخزين صحيحة وغير مضللة."
            />

            <Checkbox
              checked={acceptedSellerTerms}
              onChange={setAcceptedSellerTerms}
              text="I agree that the website is only a listing platform and intermediary. I am fully responsible for the product and transaction. أوافق أن الموقع مجرد منصة عرض ووسيط، وأنني مسؤول بالكامل عن المنتج والمعاملة."
            />

            <Link href="/policies" className="font-bold text-emerald-700">
              Read Terms, Privacy, Prohibited Items, Reporting, and Disclaimer
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Listing for Review"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}

function FileInput({
  label,
  description,
  onChange,
}: {
  label: string;
  description: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <label className="mb-2 block font-black">{label}</label>

      <p className="mb-3 text-sm leading-6 text-slate-600">{description}</p>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="w-full rounded-xl bg-white p-3 text-sm"
      />

      <p className="mt-2 text-xs text-slate-500">
        Allowed: JPG, PNG, WEBP. Maximum size: 5 MB.
      </p>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <label className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />

      <span>{text}</span>
    </label>
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