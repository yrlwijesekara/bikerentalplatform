import { RiMotorbikeFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { BsFileEarmarkImageFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { use, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MediaUpload from "../../../utils/mediaupload.jsx";

export default function AddbikePage() {
  const [bikename, setBikename] = useState("");
  const [biketype, setBiketype] = useState("Scooter");
  const [manufacturingYear, setManufacturingYear] = useState("");
  const [engineCC, setEngineCC] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [suitableTerrain, setSuitableTerrain] = useState("coastal");
  const [pricePerDay, setPricePerDay] = useState("");
  const [city, setCity] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [images, setImages] = useState([]);
  const [recommendedprice, setRecommendedprice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const navigate = useNavigate();

  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!bikename.trim()) {
      newErrors.bikename = "Bike name is required";
    }

    if (!manufacturingYear) {
      newErrors.manufacturingYear = "Manufacturing year is required";
    } else if (
      manufacturingYear < 1980 ||
      manufacturingYear > new Date().getFullYear()
    ) {
      newErrors.manufacturingYear = `Year must be between 1980 and ${new Date().getFullYear()}`;
    }

    if (!engineCC) {
      newErrors.engineCC = "Engine CC is required";
    } else if (engineCC < 50 || engineCC > 2000) {
      newErrors.engineCC = "Engine CC must be between 50 and 2000";
    }

    if (!lastServiceDate) {
      newErrors.lastServiceDate = "Last service date is required";
    } else if (new Date(lastServiceDate) > new Date()) {
      newErrors.lastServiceDate = "Service date cannot be in the future";
    }

    if (!pricePerDay) {
      newErrors.pricePerDay = "Price per day is required";
    } else if (pricePerDay <= 0) {
      newErrors.pricePerDay = "Price must be greater than 0";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    // URL validation (optional but if provided should be valid)
    if (mapUrl && !isValidUrl(mapUrl)) {
      newErrors.mapUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault(); // Prevent form from refreshing the page

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fill required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    // Handle image upload to Supabase
    let imageUrls = [];
    if (images && images.length > 0) {
      try {
        toast.loading("Uploading images...");
        const uploadPromises = Array.from(images).map((file) =>
          MediaUpload(file),
        );
        imageUrls = await Promise.all(uploadPromises);
        toast.dismiss();
        toast.success(`${imageUrls.length} images uploaded successfully!`);
        console.log("Uploaded image URLs:", imageUrls);
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to upload images: " + error);
        setIsSubmitting(false);
        return;
      }
    }

    const bikeData = {
      bikeName: bikename,
      bikeType: biketype,
      manufacturingYear: manufacturingYear,
      engineCC: engineCC,
      lastServiceDate: lastServiceDate,
      fuelType: fuelType,
      suitableTerrain: suitableTerrain,
      pricePerDay: pricePerDay,
      city: city,
      mapUrl: mapUrl,
      images: imageUrls,
      recommendedprice: recommendedprice,
      isAvailable: isAvailable,
    };
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in as a vendor to add a bike.");
      window.location.href = "/login";
      return;
    }
    axios
      .post(import.meta.env.VITE_BACKEND_URL + "/products/", bikeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        toast.success("Bike added successfully!");
        setIsSubmitting(false);
        navigate("/vendor/bikes");
      })
      .catch((error) => {
        console.error("Error adding bike:", error);
        toast.error("Failed to add bike. Please try again.");
        setIsSubmitting(false);
      });
  }

  return (
    <div className="w-full flex flex-col items-center justify-center bg-[var(--main-background)] p-4 py-6">
      <div className="w-full max-w-3xl bg-[var(--card-background)]  shadow-2xl rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--brand-primary)]">
          Add New Bike
        </h1>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Details */}
          <div className="md:col-span-2 ">
            <h3 className="text-lg font-semibold mb-3 text-(--brand-primary) border-b pb-2 flex items-center gap-2">
              <RiMotorbikeFill />
              Basic Information
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bike Name{" "}
            </label>
            <input
              type="text"
              value={bikename}
              onChange={(e) => {
                setBikename(e.target.value);
              }}
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.bikename
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              }`}
              placeholder="Enter bike name"
            />
            {errors.bikename && (
              <p className="text-red-500 text-sm mt-1">{errors.bikename}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bike Type{" "}
            </label>
            <select
              value={biketype}
              onChange={(e) => {
                setBiketype(e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
            >
              <option value="Scooter">Scooter</option>
              <option value="Gear Bike">Gear Bike</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturing Year{" "}
            </label>
            <input
              value={manufacturingYear}
              onChange={(e) => {
                setManufacturingYear(e.target.value);
              }}
              type="number"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.manufacturingYear
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              }`}
              placeholder="e.g., 2023"
              min="1980"
              max="2025"
            />
            {errors.manufacturingYear && (
              <p className="text-red-500 text-sm mt-1">
                {errors.manufacturingYear}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine CC{" "}
            </label>
            <input
              value={engineCC}
              onChange={(e) => {
                setEngineCC(e.target.value);
              }}
              type="number"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.engineCC
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              }`}
              placeholder="e.g., 150"
              min="50"
            />
            {errors.engineCC && (
              <p className="text-red-500 text-sm mt-1">{errors.engineCC}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Service Date
            </label>
            <input
              value={lastServiceDate}
              onChange={(e) => {
                setLastServiceDate(e.target.value);
              }}
              type="date"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.lastServiceDate
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              }`}
            />
            {errors.lastServiceDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastServiceDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type{" "}
            </label>
            <select
              value={fuelType}
              onChange={(e) => {
                setFuelType(e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
            >
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suitable Terrain{" "}
            </label>
            <select
              value={suitableTerrain}
              onChange={(e) => {
                setSuitableTerrain(e.target.value);
              }}
              className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
            >
              <option value="coastal">Coastal</option>
              <option value="city">City</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Pricing & Location */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3 text-(--brand-primary) border-b pb-2 mt-4 flex items-center gap-2">
              <TbReportMoney />
              Pricing & Location
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Day (LKR){" "}
            </label>
            <input
              value={pricePerDay}
              onChange={(e) => {
                setPricePerDay(e.target.value);
              }}
              type="number"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.pricePerDay
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              }`}
              placeholder="e.g., 1500"
              min="0"
            />
            {errors.pricePerDay && (
              <p className="text-red-500 text-sm mt-1">{errors.pricePerDay}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City{" "}
            </label>
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
              }}
              type="text"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.city
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-(--brand-primary) focus:ring-(--brand-primary)"
              }`}
              placeholder="e.g., Tangalle"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps URL
            </label>
            <input
              value={mapUrl}
              onChange={(e) => {
                setMapUrl(e.target.value);
              }}
              type="text"
              className={`w-full h-10 border rounded-md px-3 focus:ring-1 outline-none ${
                errors.mapUrl
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-(--brand-primary) focus:ring-(--brand-primary)"
              }`}
              placeholder="https://maps.google.com/..."
            />
            {errors.mapUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.mapUrl}</p>
            )}
          </div>

          {/* Images & Availability */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3 text-(--brand-primary) border-b pb-2 mt-4 flex items-center gap-2">
              <BsFileEarmarkImageFill />
              Images & Availability
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images
            </label>
            <input
              onChange={(e) => {
                setImages(e.target.files);
              }}
              type="file"
              multiple
              accept="image/*"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <input
                value={isAvailable}
                onChange={(e) => {
                  setIsAvailable(e.target.checked);
                }}
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-[var(--brand-primary)] border-gray-300 rounded focus:ring-[var(--brand-primary)]"
              />
              <label className="text-sm font-medium text-gray-700">
                Available for rent
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="md:col-span-2 flex gap-3 mt-6 pt-4 border-t border-(--brand-primary)">
            <Link
              to="/vendor/bikes"
              className="flex-1 h-10 border flex items-center justify-center border-gray-300 text-gray-700 rounded-md font-medium hover:bg-[var(--button-primary-bg)] hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 h-10 rounded-md text-white font-medium transition-all duration-200 ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={{ backgroundColor: "var(--button-primary-bg)" }}
            >
              {isSubmitting ? "Adding Bike..." : "Add Bike"}
            </button>
          </div>
        </form>
        <div className="w-full min-h-[80px] sm:min-h-[100px] bg-[var(--brand-warning)] mt-4 sm:mt-6 rounded p-3 sm:p-4">
          <h1 className="text-base sm:text-lg text-[var(--navbar-text)] mb-2 sm:mb-3">
            Our recommended price per day is
          </h1>
          <input
            type="text"
            value={recommendedprice}
            onChange={(e) => setRecommendedprice(e.target.value)}
            placeholder="AI Suggested Price..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
