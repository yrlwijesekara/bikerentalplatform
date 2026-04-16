import Footer from "../../../components/footer.jsx";

const cookieSections = [
  {
    title: "1. What Are Cookies",
    content:
      "Cookies are small text files stored on your device to help websites remember actions and preferences.",
  },
  {
    title: "2. How RideLanka Uses Cookies",
    content:
      "We use cookies and similar storage tools to keep users signed in, improve navigation, and support core platform functionality.",
  },
  {
    title: "3. Types of Cookies We Use",
    content:
      "Essential cookies for login and security, preference cookies for user settings, and analytics cookies to improve performance and user experience.",
  },
  {
    title: "4. Third-Party Cookies",
    content:
      "Third-party services such as analytics or embedded tools may set their own cookies according to their privacy policies.",
  },
  {
    title: "5. Managing Cookies",
    content:
      "You can control or delete cookies in your browser settings. Disabling essential cookies may limit platform functionality.",
  },
  {
    title: "6. Local Storage",
    content:
      "RideLanka also uses browser local storage for session and role management. Clearing browser data may sign you out.",
  },
  {
    title: "7. Updates to This Policy",
    content:
      "We may revise this Cookie Policy as platform features evolve. Please check this page periodically for updates.",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-(--main-background)">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(140deg,var(--support-hero-start)_0%,var(--support-hero-mid)_45%,var(--support-hero-end)_100%)] text-white">
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
              Legal
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Cookie Policy</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              This policy describes how cookies and local storage are used across RideLanka to improve reliability and user experience.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
            <div className="space-y-6">
              {cookieSections.map((section) => (
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
