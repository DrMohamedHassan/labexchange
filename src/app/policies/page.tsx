import Header from "@/components/Header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            LabFinds Policies
          </p>

          <h1 className="text-4xl font-black">Platform Policies</h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            These policies explain how LabFinds works as a marketplace for lab
            supplies and equipment. All users must read and follow these rules
            before listing, buying, reporting, or contacting sellers.
          </p>

          <div className="mt-8 grid gap-8">
            <PolicySection title="1. Platform Role">
              <p>
                LabFinds is an online marketplace that connects buyers and
                sellers. LabFinds does not own the listed products, does not
                inspect every product physically, does not process payments
                between users, and is not a party to buyer-seller transactions.
              </p>

              <p>
                Admin review helps reduce risk, but it does not guarantee
                product safety, legality, quality, suitability, or performance.
                Buyers and sellers remain responsible for their own decisions.
              </p>
            </PolicySection>

            <PolicySection title="2. Seller Responsibility">
              <p>
                Sellers must provide accurate and complete information about the
                item, including title, category, condition, photos, price,
                expiry date, storage condition, location, documents, and any
                known defects or risks.
              </p>

              <p>
                Sellers confirm that they legally own the item or have authority
                to sell it. Sellers are fully responsible for product accuracy,
                ownership, legal compliance, and any documents they upload.
              </p>
            </PolicySection>

            <PolicySection title="3. Prohibited Products">
              <p>
                Users must not list stolen, expired, contaminated, unsafe,
                illegal, prohibited, or hazardous products.
              </p>

              <p>
                LabFinds does not allow the sale of drugs, medical waste, human
                or animal samples, blood, tissue, cultures, bacteria, viruses,
                biological materials, radioactive materials, or any unsafe or
                contaminated laboratory material.
              </p>
            </PolicySection>

            <PolicySection title="4. Restricted or Regulated Products">
              <p>
                Medical devices, diagnostic kits, IVD products, chemicals,
                biological materials, drugs, reagents, or regulated products
                must not be listed unless the seller has valid legal documents
                and the item is allowed to be sold under applicable laws and
                regulations.
              </p>

              <p>
                LabFinds admin may reject, freeze, hide, remove, or request more
                documents for any listing that appears regulated, unsafe,
                misleading, incomplete, or suspicious.
              </p>
            </PolicySection>

            <PolicySection title="5. Admin Review and Removal Rights">
              <p>
                LabFinds admin may approve, reject, freeze, hide, edit status,
                or remove listings when needed to protect users and the
                platform.
              </p>

              <p>
                Admin may also review seller verification requests, reports,
                complaints, contact messages, and seller reviews. Admin
                decisions are based on available information and platform safety
                rules.
              </p>
            </PolicySection>

            <PolicySection title="6. Buyer Safety Advice">
              <p>
                Buyers should inspect the product before payment. Buyers should
                check product condition, expiry date, storage condition,
                supporting documents, seller identity, quantity, packaging, and
                any legal or regulatory requirements before completing a deal.
              </p>

              <p>
                Buyers are advised to meet sellers in a safe and trusted place,
                such as a research center, laboratory, university, company,
                hospital, or official workplace.
              </p>

              <p>
                Buyers must not buy prohibited, unsafe, expired, contaminated,
                stolen, hazardous, or unlicensed regulated products.
              </p>
            </PolicySection>

            <PolicySection title="7. Login Required">
              <p>
                Users must be registered and signed in before sending requests,
                complaints, misleading product reports, listing products, or
                contacting sellers through WhatsApp.
              </p>

              <p>
                This rule helps reduce anonymous abuse, fake complaints, unsafe
                transactions, and fraud.
              </p>
            </PolicySection>

            <PolicySection title="8. Seller Verification">
              <p>
                Seller verification is used to increase trust. LabFinds may ask
                for an official email, work ID, company registration, lab proof,
                university proof, or organization proof.
              </p>

              <p>
                LabFinds does not request national ID or passport by default.
                Uploaded verification documents are not shown publicly and are
                reviewed only by admin for verification purposes.
              </p>
            </PolicySection>

            <PolicySection title="9. Complaints and Reports">
              <p>
                Logged-in users can submit complaints, misleading product
                reports, buyer issues, seller issues, or help requests.
              </p>

              <p>
                Admin may reply to the request, update its status, and notify
                the user through their LabFinds notification center. Users can
                see admin replies from their My Requests page.
              </p>
            </PolicySection>

            <PolicySection title="10. Reviews">
              <p>
                Seller reviews must be honest, based on real experience, and
                must not include insults, private information, threats, fake
                claims, or unsupported accusations.
              </p>

              <p>
                Reviews may require admin approval before appearing publicly.
                Admin may reject or remove reviews that are abusive, misleading,
                fake, or unsafe.
              </p>
            </PolicySection>

            <PolicySection title="11. Payments and Transactions">
              <p>
                LabFinds does not handle payments between buyers and sellers.
                Buyers and sellers are responsible for agreeing on payment,
                delivery, inspection, documents, and final transaction details.
              </p>

              <p>
                Buyers should avoid sending money before inspection unless they
                fully trust the seller and understand the risk.
              </p>
            </PolicySection>

            <PolicySection title="12. Disclaimer">
              <div className="rounded-3xl bg-slate-50 p-5 font-bold leading-8 text-slate-800">
                The website serves solely as an online platform connecting
                buyers and sellers. The website is not responsible for any
                products, transactions, payments, agreements, or disputes
                between users.
              </div>
            </PolicySection>
          </div>
        </section>
      </div>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-black">{title}</h2>

      <div className="mt-4 grid gap-4 leading-8 text-slate-700">
        {children}
      </div>
    </section>
  );
}