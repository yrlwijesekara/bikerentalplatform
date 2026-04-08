import { useMemo, useState } from "react";
import axios from "axios";
import Footer from "../../../components/footer";

const apiBaseUrl = import.meta.env.VITE_ROUTE_SAFETY_API_URL ;

export default function RouteSafety() {
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const staticTips = useMemo(() => ([
        "Always wear a helmet and protective gear.",
        "Follow traffic rules and traffic signals.",
        "Use bright clothing and lights for visibility.",
        "Avoid phone use or other distractions while riding.",
        "Be cautious of poor road conditions and weather.",
        "Ride defensively and keep a safe following distance.",
    ]), []);

    const fetchRouteSafety = async (cityValue = "") => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.post(`${apiBaseUrl}/api/route-safety/predict`, {
                city: cityValue.trim(),
            });
            setResult(response.data);
        } catch (err) {
            const apiMessage = err?.response?.data?.error;
            setError(apiMessage || "Failed to fetch route safety data. Please try again.");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckRoute = async (event) => {
        event.preventDefault();
        if (!city.trim()) {
            setError("City is required.");
            setResult(null);
            return;
        }
        await fetchRouteSafety(city);
    };

    return (
        <div className="w-full min-h-screen bg-(--main-background) flex flex-col ">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black text-center">AI Route Safety</h1>
            <p className="text-gray-700 mb-6">
                Enter a Sri Lankan city to get live weather-aware accident risk and riding guidance.
            </p>

            <form onSubmit={handleCheckRoute} className="bg-white border rounded-xl p-4 md:p-6 shadow-sm mb-6 overflow-hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Required: e.g. Colombo, Kandy, Galle"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                    >
                        {loading ? "Checking..." : "Check Route Safety"}
                    </button>
                </div>
                {error && <p className="text-red-600 mt-3">{error}</p>}
            </form>

            {result && (
                <div className="bg-white  rounded-xl p-4 md:p-6 shadow-2xl mb-6">
                    <h2 className="text-xl font-semibold text-black mb-4">Prediction Result</h2>
                    {result.weather_source && result.weather_source !== "live_api" && (
                        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
                            Live weather is temporarily unavailable. Showing {result.weather_source.replaceAll("_", " ")}.
                        </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
                        <p><strong>Location:</strong> {result.official_location}</p>
                        <p><strong>Final Risk:</strong> {result.final_risk_level}</p>
                        <p><strong>Historical Risk:</strong> {result.base_historical_risk}</p>
                        <p><strong>Terrain:</strong> {result.terrain_type}</p>
                        <p><strong>Temperature:</strong> {result.temperature_c} C</p>
                        <p><strong>Humidity:</strong> {result.humidity_percent}%</p>
                        <p><strong>Rainfall:</strong> {result.rainfall_mm} mm</p>
                        <p><strong>Elevation:</strong> {result.elevation_m} m</p>
                    </div>

                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Temperature (Next Hours)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left px-3 py-2 border-b">Time</th>
                                        <th className="text-left px-3 py-2 border-b">Temperature</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.hourly_temperature_next_hours?.length ? (
                                        result.hourly_temperature_next_hours.map((slot, index) => (
                                            <tr key={`${slot.time}-${index}`} className="odd:bg-white even:bg-gray-50">
                                                <td className="px-3 py-2 border-b">{slot.time}</td>
                                                <td className="px-3 py-2 border-b">{slot.temperature_c} C</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-3 py-2" colSpan={2}>Hourly temperature data is unavailable.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Safety Advice</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-800">
                            {result.safety_tips?.map((tip, index) => (
                                <li key={`${tip}-${index}`}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 md:p-6 shadow-2xl">
                <h2 className="text-lg font-semibold mb-3 text-black">General Route Safety Tips</h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {staticTips.map((tip, index) => (
                        <li key={`${tip}-${index}`}>{tip}</li>
                    ))}
                </ul>
            </div>
            
        </div>
        <Footer />
        </div>
    );
}