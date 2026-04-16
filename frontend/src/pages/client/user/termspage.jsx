import Footer from "../../../components/footer.jsx";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using RideLanka, you agree to these Terms and Conditions. If you do not agree, please stop using the platform.",
  },
  {
    title: "2. Platform Role",
    content:
      "RideLanka connects renters and bike vendors in Sri Lanka. Availability, pricing, and bike condition details are provided by vendors.",
  },
  {
    title: "3. User Responsibilities",
    content:
      "Users must provide accurate profile and booking information, hold valid licenses where required, and follow Sri Lankan traffic and safety laws.",
  },
  {
    title: "4. Booking and Payments",
    content:
      "All bookings are subject to vendor confirmation, availability, and payment validation. Charges, refunds, and cancellation policies may vary by booking.",
  },
  {
    title: "5. Cancellations and Refunds",
    content:
      "Refund timelines and eligibility depend on booking status and vendor policy. Approved refunds are typically processed within 5-7 business days.",
  },
  {
    title: "6. Prohibited Use",
    content:
      "You may not use the platform for unlawful activity, fraud, account misuse, or any action that affects platform security or other users.",
  },
  {
    title: "7. Liability",
    content:
      "RideLanka is not liable for losses caused by rider negligence, traffic incidents, or third-party actions outside direct platform control.",
  },
  {
    title: "8. Changes to Terms",
    content:
      "These terms may be updated periodically. Continued use of the platform after updates means you accept the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-(--main-background)">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(140deg,var(--support-hero-start)_0%,var(--support-hero-mid)_45%,var(--support-hero-end)_100%)] text-white">
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
              Legal
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Terms and Conditions</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              These terms govern your use of RideLanka bike rental services and related features. Please review them carefully before booking or listing bikes.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
            <div className="space-y-6">
              {termsSections.map((section) => (
                <article key={section.title} className="rounded-2xl bg-slate-50 p-5">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-700 md:text-base">{section.content}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-sm text-slate-500">Last updated: April 16, 2026</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
