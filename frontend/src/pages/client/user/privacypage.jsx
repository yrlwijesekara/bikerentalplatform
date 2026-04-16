import Footer from "../../../components/footer.jsx";

const privacySections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect account details, booking information, communication records, and optional profile data needed to provide rental services.",
  },
  {
    title: "2. How We Use Data",
    content:
      "Your data is used to manage bookings, process payments, send notifications, improve recommendations, and provide support.",
  },
  {
    title: "3. Data Sharing",
    content:
      "We share required booking details with vendors and service providers only as needed to fulfill platform operations.",
  },
  {
    title: "4. Security",
    content:
      "We apply technical and organizational measures to protect personal data, but no online system can guarantee absolute security.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain data for legal, operational, and support reasons, then delete or anonymize it when no longer required.",
  },
  {
    title: "6. Your Rights",
    content:
      "You may request access, correction, or deletion of personal data by contacting support, subject to legal and operational limits.",
  },
  {
    title: "7. Third-Party Services",
    content:
      "Some features rely on third-party tools such as payments, maps, or analytics, which may process data under their own policies.",
  },
  {
    title: "8. Policy Updates",
    content:
      "This Privacy Policy may be updated from time to time. Continued use after updates indicates acceptance of the revised policy.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-(--main-background)">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(140deg,var(--support-hero-start)_0%,var(--support-hero-mid)_45%,var(--support-hero-end)_100%)] text-white">
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
              Legal
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Privacy Policy</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              This policy explains what personal information RideLanka collects, why it is used, and how we protect it.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
            <div className="space-y-6">
              {privacySections.map((section) => (
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
