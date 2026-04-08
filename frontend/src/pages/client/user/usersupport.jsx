import { Link } from "react-router-dom";
import Footer from "../../../components/footer.jsx";

const helpItems = [
    {
        title: "Booking help",
        description: "Questions about reservations, cancellations, or payment status.",
        action: "Check My Bookings",
        to: "/my-bookings",
    },
    {
        title: "Find a bike",
        description: "Need help choosing the right bike or scooter for your trip?",
        action: "Browse Bikes",
        to: "/find-bikes",
    },
    {
        title: "Route safety",
        description: "Get suggestions for terrain, traffic, and road conditions.",
        action: "Open Safety Guide",
        to: "/routes",
    },
    {
        title: "AI recommendations",
        description: "Use rainfall, traffic, and elevation to pick the right ride.",
        action: "Try AI Suggestions",
        to: "/ai-suggestions",
    },
];

const faqItems = [
    {
        question: "How do I contact support?",
        answer: "Use the email or phone details below, or open the support links in the footer.",
    },
    {
        question: "What if my booking needs to be changed?",
        answer: "Go to My Bookings and check the current booking status before contacting support.",
    },
    {
        question: "Do you help vendors too?",
        answer: "Yes. Vendor users can use the footer's business support links and contact details.",
    },
];

export default function Support() {
    return (
        <div className="flex min-h-screen flex-col bg-(--main-background)">
            <main className="flex-1">
                <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,var(--support-hero-start)_0%,var(--support-hero-mid)_45%,var(--support-hero-end)_100%)] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--support-hero-glow),transparent_35%),radial-gradient(circle_at_bottom_left,var(--support-hero-accent),transparent_30%)]" />
                    <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
                        <div className="max-w-2xl">
                            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
                                Support Center
                            </p>
                            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                                Get help fast and keep your trip moving.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-(--support-hero-glow) md:text-base">
                                Use this page to contact support, find useful self-service links, and get answers to common questions about bookings, bikes, and safety.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                                <h2 className="text-2xl font-bold text-slate-900">Contact details</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    For direct support, reach out using any of the channels below.
                                </p>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</p>
                                        <a href="mailto:support@ridelanka.com" className="mt-2 block text-lg font-semibold text-slate-900 hover:text-(--support-link-hover)">
                                            support@ridelanka.com
                                        </a>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</p>
                                        <a href="tel:+94111234567" className="mt-2 block text-lg font-semibold text-slate-900 hover:text-(--support-link-hover)">
                                            +94 11 123 4567
                                        </a>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Response time</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">Within 24 hours</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Availability</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">Daily support desk</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                                <h2 className="text-2xl font-bold text-slate-900">Quick help</h2>
                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    {helpItems.map((item) => (
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
                                <h2 className="text-2xl font-bold">Support tips</h2>
                                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                                    <li>Have your booking ID ready before contacting support.</li>
                                    <li>For route and weather questions, try the AI suggestions page first.</li>
                                    <li>Vendor users can use the footer's business support links for account issues.</li>
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                                <h2 className="text-2xl font-bold text-slate-900">Frequently asked</h2>
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