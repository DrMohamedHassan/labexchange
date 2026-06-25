import Image from "next/image";
import Link from "next/link";

type ListingCardProps = {
  id: number;
  title: string;
  category: string;
  condition: string;
  city: string;
  price?: number | string | null;
  imageUrl?: string | null;
  status?: string | null;
};

export default function ListingCard({
  id,
  title,
  category,
  condition,
  city,
  price,
  imageUrl,
  status = "approved",
}: ListingCardProps) {
  const productImage = imageUrl || "/images/product-placeholder.png";
  const isSold = status === "sold";
  const formattedPrice = formatPrice(price);

  return (
    <Link
      href={`/listings/${id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 bg-slate-100">
        <Image src={productImage} alt={title} fill className="object-cover" />

        <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
          {condition || "Condition not provided"}
        </span>

        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-base font-extrabold text-slate-950 group-hover:text-emerald-700">
          {title || "Untitled listing"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {category || "General"}
        </p>

        {isSold && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            This product has been marked as sold.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
          <span>{city || "City not provided"}</span>
          <span>â™¡</span>
        </div>

        <p className="mt-4 text-lg font-black text-slate-950">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}

function formatPrice(price?: number | string | null) {
  if (price === null || price === undefined || price === "") {
    return "Price not provided";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Price not provided";
  }

  return `${numericPrice.toLocaleString()} EGP`;
}
