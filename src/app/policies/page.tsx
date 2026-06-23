import Header from "@/components/Header";
import Link from "next/link";

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Website Policies</h1>

          <p className="mt-4 text-slate-600">
            These policies explain how LabExchange works as an online listing
            platform between buyers and sellers.
          </p>

          <PolicySection title="1. Terms of Service">
            <p>
              The website is only a platform for listing and displaying
              advertisements.
            </p>
            <p>
              The website acts solely as an intermediary between buyers and
              sellers.
            </p>
            <p>
              Buyers and sellers are fully responsible for their transactions.
            </p>
            <p>
              The website does not guarantee the quality, safety, legality, or
              authenticity of any listed products.
            </p>
            <p>
              The website is not responsible for any disputes, losses, fraud, or
              damages arising from transactions between users.
            </p>
          </PolicySection>

          <PolicySection title="2. Privacy Policy">
            <p>
              The website may collect personal information such as name, email,
              phone number, city, account details, listing information, product
              images, and seller contact details.
            </p>
            <p>
              This information is used to create accounts, display listings,
              allow buyers and sellers to communicate, review listings, and
              improve platform safety.
            </p>
            <p>
              User information is not sold to third parties. Some information,
              such as seller name and phone number, may be displayed publicly on
              approved listings.
            </p>
            <p>
              Users can request account deletion and personal data deletion by
              contacting the website administrator.
            </p>
          </PolicySection>

          <PolicySection title="3. Prohibited Items Policy">
            <p>The website prohibits listing or selling:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Restricted or illegal medicines.</li>
              <li>Hazardous or dangerous materials.</li>
              <li>Harmful chemical products.</li>
              <li>Counterfeit products.</li>
              <li>Illegal goods or substances.</li>
              <li>
                Any products that require special governmental licenses,
                approvals, or restricted handling.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Reporting and Content Removal">
            <p>Users can report:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Inappropriate or misleading advertisements.</li>
              <li>Fraudulent activities.</li>
              <li>Intellectual property violations.</li>
              <li>Illegal or prohibited content.</li>
            </ul>
            <p>
              The website reserves the right to remove any content or listings
              that violate its policies.
            </p>
          </PolicySection>

          <PolicySection title="5. Disclaimer">
            <p className="rounded-2xl bg-slate-50 p-5 font-semibold">
              The website serves solely as an online platform connecting buyers
              and sellers. The website is not responsible for any products,
              transactions, payments, agreements, or disputes between users.
            </p>
          </PolicySection>

          <PolicySection title="6. Buyer Safety Advice">
            <p>
              Buyers are advised to meet sellers in a safe and trusted place,
              such as a research center, laboratory, university, or official
              workplace.
            </p>
            <p>
              Buyers should check product condition, expiry date, storage
              condition, supporting documents, and seller identity before
              payment.
            </p>
            <p>
              ننصح المشتري بمقابلة البائع في مكان آمن وموثوق مثل مركز بحثي،
              معمل، جامعة، أو مكان عمل رسمي، وفحص المنتج والمستندات قبل الدفع.
            </p>
          </PolicySection>
        </div>
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
    <section className="mt-8 border-t border-slate-200 pt-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}