import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ADMIN_SETTINGS_STORAGE_KEY = "adminPanelSettings";
const DEFAULT_BACKGROUND = "#F8F9FA";

const presetColors = [
    "#F8F9FA",
    "#EAF2FF",
    "#FFF4E6",
    "#EEFCE8",
    "#F3E8FF",
    "#0F172A",
    "#111827",
    "#1E293B",
];

export default function Setting() {
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
            if (!savedSettings) {
                return;
            }

            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings?.backgroundColor) {
                setBackgroundColor(parsedSettings.backgroundColor);
            }
        } catch (error) {
            console.warn("Failed to read admin settings:", error);
        }
    }, []);

    const saveBackgroundColor = (color, showToast = false) => {
        const nextSettings = { backgroundColor: color };
        localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
        setBackgroundColor(color);
        window.dispatchEvent(new CustomEvent("admin-settings-updated"));

        if (showToast) {
            toast.success("Admin panel color updated");
        }
    };

    const handleColorInputChange = (event) => {
        saveBackgroundColor(event.target.value);
    };

    const handleSave = () => {
        saveBackgroundColor(backgroundColor, true);
    };

    const resetColor = () => {
        saveBackgroundColor(DEFAULT_BACKGROUND, true);
    };

    return (
        <div className="min-h-full p-6 md:p-8" style={{ backgroundColor: "var(--main-background)" }}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--section-divider)" }}>
                    <h1 className="text-2xl font-semibold" style={{ color: "var(--brand-primary)" }}>
                        Admin Panel Settings
                    </h1>
                    <p className="text-sm mt-2" style={{ color: "var(--navbar-border)" }}>
                        Change the admin panel background color. The color updates immediately and stays after refresh.
                    </p>
                </div>

                <div className="rounded-2xl p-6 border shadow-sm space-y-5" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--section-divider)" }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold" style={{ color: "var(--brand-primary)" }}>
                                Background Color
                            </h2>
                            <p className="text-sm mt-1" style={{ color: "var(--navbar-border)" }}>
                                Pick any color or choose one of the presets.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={backgroundColor}
                                onChange={handleColorInputChange}
                                className="w-14 h-10 cursor-pointer rounded border"
                                style={{ borderColor: "var(--section-divider)" }}
                            />
                            <span className="text-sm font-medium px-3 py-2 rounded border" style={{ borderColor: "var(--section-divider)", color: "var(--brand-primary)" }}>
                                {backgroundColor.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-3" style={{ color: "var(--brand-primary)" }}>
                            Preset Colors
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {presetColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => saveBackgroundColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform ${backgroundColor.toLowerCase() === color.toLowerCase() ? "scale-110" : "hover:scale-105"}`}
                                    style={{ backgroundColor: color, borderColor: "var(--section-divider)" }}
                                    title={`Set ${color} background`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border p-4" style={{ borderColor: "var(--section-divider)", backgroundColor: backgroundColor }}>
                        <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                            Live Preview
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#334155" }}>
                            This is how your admin panel background will look.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ backgroundColor: "var(--button-primary-bg)" }}
                        >
                            Save Color
                        </button>
                        <button
                            type="button"
                            onClick={resetColor}
                            className="px-4 py-2 rounded-lg text-sm font-medium border"
                            style={{ color: "var(--brand-primary)", borderColor: "var(--section-divider)" }}
                        >
                            Reset Default
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}