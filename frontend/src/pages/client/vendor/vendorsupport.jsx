import { Link } from "react-router-dom";
import Footer from "../../../components/footer.jsx";

const supportCards = [
  {
    title: "Bookings & payouts",
    description: "Help with booking statuses, completed trips, and payout-related questions.",
    action: "Open Vendor Bookings",
    to: "/vendor/bookings",
  },
  {
    title: "Fleet management",
    description: "Questions about bike listings, edits, availability, and publishing issues.",
    action: "Manage My Bikes",
    to: "/vendor/bikes",
  },
  {
    title: "Performance insights",
    description: "Review earnings, booking trends, and business performance from one place.",
    action: "View Earnings",
    to: "/vendor/earning",
  },
  {
    title: "Customer reviews",
    description: "See review feedback and vendor reputation metrics for your business.",
    action: "Open Reviews",
    to: "/vendor/reviews",
  },
];

const faqItems = [
  {
    question: "How do I change my bike listing?",
    answer: "Go to My Bikes or use the vendor dashboard to update availability and details.",
  },
  {
    question: "Where can I check booking issues?",
    answer: "Use Vendor Bookings to inspect the current booking status before contacting support.",
  },
  {
    question: "Who handles payout questions?",
    answer: "Use this page's contact details for payment and account-related business support.",
  },
];

export default function VendorSupport() {
  return (
    <div className="flex min-h-screen flex-col bg-(--main-background)">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,var(--support-hero-start)_0%,#12213b_45%,var(--navbar-active)_100%)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,140,0,0.18),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
                Vendor Business Support
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                Support for bookings, bikes, earnings, and vendor operations.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                Use this page when you need help running your business on RideLanka. It groups the most common vendor support requests in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-bold text-slate-900">Business contact details</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Reach the vendor support desk for business, booking, and account issues.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business email</p>
                    <a href="mailto:ridelanka95@gmail.com" className="mt-2 block text-lg font-semibold text-slate-900 hover:text-(--support-link-hover)">
                      ridelanka95@gmail.com
                    </a>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business phone</p>
                    <a href="tel:+94111234567" className="mt-2 block text-lg font-semibold text-slate-900 hover:text-(--support-link-hover)">
                      +94 11 123 4567
                    </a>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Support hours</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">24/7 business support</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Response time</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Within 1 business day</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-bold text-slate-900">Business tools</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {supportCards.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                      <Link to={item.to} className="mt-4 inline-flex text-sm font-semibold text-(--support-link) hover:text-(--support-link-hover)">
                        {item.action}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                <h2 className="text-2xl font-bold">What to prepare</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>Keep your vendor account email ready.</li>
                  <li>Have booking IDs or bike IDs for faster issue resolution.</li>
                  <li>Use the dashboard or bike pages before sending a request when possible.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-bold text-slate-900">Vendor FAQs</h2>
                <div className="mt-5 space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.question} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}