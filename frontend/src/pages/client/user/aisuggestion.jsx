import { useMemo, useState } from "react";
import axios from "axios";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const apiBaseUrl = import.meta.env.VITE_BIKE_RECOMMENDATION_API_URL;

export default function Aisuggestion() {
  const [city, setCity] = useState("");
  const [trafficRisk, setTrafficRisk] = useState("0");
  const [rainfallMm, setRainfallMm] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const quickTips = useMemo(() => ([
    "Higher elevation often performs better with geared bikes.",
    "Busy city roads can favor scooters for ease of handling.",
    "Rain makes traction and braking more important.",
  ]), []);

  const fetchRecommendation = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${apiBaseUrl}/api/bike-recommendation/predict`, {
        city: city.trim(),
        traffic_risk: Number(trafficRisk),
        rainfall_mm: Number(rainfallMm),
      });

      setResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch bike recommendation.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-amber-50 flex flex-col">
      

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            <section className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 mb-4">
                AI Bike Recommendation
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Find the right bike for the road you are riding on.
              </h1>
              <p className="mt-3 text-slate-600 max-w-2xl">
                Enter a Sri Lankan city plus road conditions, and the Flask backend will use
                your trained model to recommend a geared bike or an automatic scooter.
              </p>

              <form onSubmit={fetchRecommendation} className="mt-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo, Kandy, Nuwara Eliya"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Traffic Risk</label>
                    <select
                      value={trafficRisk}
                      onChange={(e) => setTrafficRisk(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    >
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rainfall (mm)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(e.target.value)}
                    placeholder="0 for dry weather"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl  bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-70"
                >
                  {loading ? "Getting recommendation..." : "Get Bike Recommendation"}
                </button>
              </form>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-[var(--navbar-bg)] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                <h2 className="text-xl font-semibold">How it works</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  {quickTips.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result ? (
                <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                    Recommended: {result.recommendation_label}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900">
                    {result.recommendation_label}
                  </h3>
                  <p className="mt-2 text-slate-600">{result.reason}</p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900">{result.official_location}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Elevation</p>
                      <p className="font-semibold text-slate-900">{result.elevation_m} m</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Traffic</p>
                      <p className="font-semibold text-slate-900">{result.traffic_risk_label}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-slate-500">Rainfall</p>
                      <p className="font-semibold text-slate-900">{result.rainfall_mm} mm</p>
                    </div>
                  </div>

                  {typeof result.confidence === 'number' && (
                    <p className="mt-4 text-sm text-slate-500">
                      Model confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
                  Your recommendation will appear here after you submit the form.
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}