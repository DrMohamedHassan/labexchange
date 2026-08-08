import Header from "@/components/Header";
import SearchResultsCountryView, {
  SearchListing,
} from "@/components/SearchResultsCountryView";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

type PublicListing = {
  id: number;
  seller_id: string | null;
  seller_phone: string | null;
  title: string | null;
  category: string | null;
  condition: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  brand: string | null;
  price: number | string | null;
  price_currency: string | null;
  image_url: string | null;
  product_image_url: string | null;
  status: string | null;
  sold_expires_at: string | null;
};

type CategoryRule = {
  displayName: string;
  databaseValues: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    displayName: "Molecular Biology",
    databaseValues: ["Molecular Biology"],
  },
  {
    displayName: "Chemicals & Reagents",
    databaseValues: ["Chemicals & Reagents"],
  },
  {
    displayName: "Cell Culture & Cell Lines",
    databaseValues: [
      "Cell Culture & Cell Lines",
      "Cell Culture & Tissue Engineering",
    ],
  },
  {
    displayName: "Lab Supplies & Equipment",
    databaseValues: [
      "Lab Supplies & Equipment",
      "Lab Equipment & Supplies",
      "Laboratory Supplies & Equipment",
    ],
  },
];

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const rawQuery = Array.isArray(params.q)
    ? params.q[0] || ""
    : params.q || "";

  const query = String(rawQuery).trim();

  const categoryRule = getCategoryRule(query);

  let request = supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, description, brand, price, price_currency, image_url, product_image_url, status, sold_expires_at"
    )
    .in("status", ["approved", "sold"]);

  /*
   * IMPORTANT:
   * If the query is an official Shop by Category name,
   * Supabase itself filters the database category.
   *
   * So Molecular Biology cannot enter
   * Chemicals & Reagents results.
   */
  if (categoryRule) {
    request = request.in(
      "category",
      categoryRule.databaseValues
    );
  }

  const { data, error } = await request.order(
    "created_at",
    {
      ascending: false,
    }
  );

  const now = new Date();

  const listings = (
    (data || []) as PublicListing[]
  ).filter((listing) => {
    if (listing.status === "approved") {
      return true;
    }

    if (
      listing.status === "sold" &&
      listing.sold_expires_at
    ) {
      return (
        new Date(listing.sold_expires_at) >
        now
      );
    }

    return false;
  });

  return (
    <main className="min-h-screen bg-[#f6fafb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="font-bold text-emerald-700"
            >
              ← Back to homepage
            </Link>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              {categoryRule
                ? "Exact category"
                : "Smart search"}
            </span>
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            {categoryRule
              ? categoryRule.displayName
              : "Search Results"}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {categoryRule ? (
              <>
                Showing only products
                saved in the category:{" "}
                <span className="font-black text-slate-950">
                  {categoryRule.displayName}
                </span>
              </>
            ) : (
              <>
                Results for:{" "}
                <span className="font-black text-slate-950">
                  {query ||
                    "All approved items"}
                </span>
              </>
            )}
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {categoryRule
              ? "Category results use exact database filtering. Products from other categories are excluded."
              : "Search is case-insensitive and finds related products. Results are also filtered by the user-selected country."}
          </p>
        </div>
      </section>

      <SearchResultsCountryView
        query={query}
        listings={
          listings as SearchListing[]
        }
        exactCategoryName={
          categoryRule?.displayName || ""
        }
        exactCategoryValues={
          categoryRule?.databaseValues || []
        }
        errorMessage={
          error ? error.message : null
        }
      />
    </main>
  );
}

function normalizeCategory(
  value: string | null | undefined
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getCategoryRule(
  query: string
): CategoryRule | null {
  const normalizedQuery =
    normalizeCategory(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    CATEGORY_RULES.find((rule) => {
      if (
        normalizeCategory(
          rule.displayName
        ) === normalizedQuery
      ) {
        return true;
      }

      return rule.databaseValues.some(
        (databaseValue) =>
          normalizeCategory(
            databaseValue
          ) === normalizedQuery
      );
    }) || null
  );
}