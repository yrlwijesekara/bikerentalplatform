import { RiMotorbikeFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { BsFileEarmarkImageFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";







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
    const [isAvailable, setIsAvailable] = useState(true);

    function handleSubmit(e) {
        e.preventDefault(); // Prevent form from refreshing the page
        
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
            images: [],
            isAvailable: isAvailable,
            
        };  
        const token = localStorage.getItem("token");
        if(!token){
            toast.error("You must be logged in as a vendor to add a bike.");
            window.location.href = "/login";
            return;
        }
        axios.post(import.meta.env.VITE_BACKEND_URL + "/products/", bikeData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            toast.success("Bike added successfully!");
            window.location.href = "/vendor/bikes";
        })
        .catch((error) => {
            console.error("Error adding bike:", error);
            toast.error("Failed to add bike. Please try again.");
        });

        
    }


  return (
    <div className="w-full flex flex-col items-center justify-center bg-[var(--main-background)] p-4 py-6">

        <div className="w-full max-w-3xl bg-[var(--card-background)]  shadow-2xl rounded-xl p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-[var(--brand-primary)]">Add New Bike</h1>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Details */}
                <div className="md:col-span-2 ">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <RiMotorbikeFill />Basic Information</h3>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bike Name </label>
                    <input type="text" 
                    value={bikename}
                    onChange={(e)=>{setBikename(e.target.value)}}
                    className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="Enter bike name"/>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bike Type </label>
                    <select 
                    value={biketype}
                    onChange={(e)=>{setBiketype(e.target.value)}}
                    className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none">
                        <option value="Scooter">Scooter</option>
                        <option value="Gear Bike">Gear Bike</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year </label>
                    <input 
                    value={manufacturingYear}
                    onChange={(e)=>{setManufacturingYear(e.target.value)}}
                    type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 2023" min="1980" max="2025"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine CC </label>
                    <input
                    value={engineCC}
                    onChange={(e)=>{setEngineCC(e.target.value)}}
                     type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 150" min="50"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                    <input
                    value={lastServiceDate}
                    onChange={(e)=>{setLastServiceDate(e.target.value)}}
                     type="date" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type </label>
                    <select
                    value={fuelType}
                    onChange={(e)=>{setFuelType(e.target.value)}}
                     className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none">
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suitable Terrain </label>
                    <select
                    value={suitableTerrain}
                    onChange={(e)=>{setSuitableTerrain(e.target.value)}}
                     className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none">
                        <option value="coastal">Coastal</option>
                        <option value="city">City</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>

                {/* Pricing & Location */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 mt-4 flex items-center gap-2">
                        <TbReportMoney />Pricing & Location</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (LKR) </label>
                    <input
                    value={pricePerDay}
                    onChange={(e)=>{setPricePerDay(e.target.value)}}
                     type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 1500" min="0"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City </label>
                    <input
                    value={city}
                    onChange={(e)=>{setCity(e.target.value)}}
                     type="text" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., Tangalle"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
                    <input
                    value={mapUrl}
                    onChange={(e)=>{setMapUrl(e.target.value)}}
                     type="text" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="https://maps.google.com/..." />
                </div>

               

                {/* Images & Availability */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 mt-4 flex items-center gap-2">
                       <BsFileEarmarkImageFill />Images & Availability</h3>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                    <input
                    value={images}
                    onChange={(e)=>{setImages(e.target.value)}}
                     type="file" multiple className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"/>
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                        <input
                        value={isAvailable}
                        onChange={(e)=>{setIsAvailable(e.target.checked)}}
                         type="checkbox" defaultChecked className="w-4 h-4 text-[var(--brand-primary)] border-gray-300 rounded focus:ring-[var(--brand-primary)]"/>
                        <label className="text-sm font-medium text-gray-700">Available for rent</label>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="md:col-span-2 flex gap-3 mt-6 pt-4 border-t">
                    <Link to="/vendor/bikes" className="flex-1 h-10 border flex items-center justify-center border-gray-300 text-gray-700 rounded-md font-medium hover:bg-[var(--button-primary-bg)] hover:text-white transition-colors">
                        Cancel
                    </Link>
                    <button 
                    type="button" onClick={handleSubmit} className="flex-1 h-10 rounded-md text-white font-medium transition-all duration-200 hover:opacity-90"
                        style={{backgroundColor: 'var(--button-primary-bg)'}}>
                        Add Bike
                    </button>
                </div>
            </form>

        </div>
      
    </div>
  )
}
