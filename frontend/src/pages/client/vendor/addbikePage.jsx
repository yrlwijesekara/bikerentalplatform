import { RiMotorbikeFill } from "react-icons/ri";
import { TbReportMoney } from "react-icons/tb";
import { BsFileEarmarkImageFill } from "react-icons/bs";
import { Link } from "react-router-dom";
export default function AddbikePage() {
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bike Name *</label>
                    <input type="text" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="Enter bike name"/>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bike Type *</label>
                    <select className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none">
                        <option value="Scooter">Scooter</option>
                        <option value="Gear Bike">Gear Bike</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year *</label>
                    <input type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 2023" min="1980" max="2025"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine CC *</label>
                    <input type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 150" min="50"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                    <input type="date" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                    <select className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none">
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>

                {/* Pricing & Location */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 mt-4 flex items-center gap-2">
                        <TbReportMoney />Pricing & Location</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (LKR) *</label>
                    <input type="number" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., 2500" min="100"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="e.g., Colombo"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input type="number" step="any" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="6.9271"/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input type="number" step="any" className="w-full h-10 border border-gray-300 rounded-md px-3 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none" placeholder="79.8612"/>
                </div>

                {/* Images & Availability */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 mt-4 flex items-center gap-2">
                       <BsFileEarmarkImageFill />Images & Availability</h3>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                    <input type="file" multiple accept="image/*" className="w-full h-10 border border-gray-300 rounded-md px-3 py-1 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-sm"/>
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-[var(--brand-primary)] border-gray-300 rounded focus:ring-[var(--brand-primary)]"/>
                        <label className="text-sm font-medium text-gray-700">Available for rent</label>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="md:col-span-2 flex gap-3 mt-6 pt-4 border-t">
                    <Link to="/vendor/bikes" className="flex-1 h-10 border flex items-center justify-center border-gray-300 text-gray-700 rounded-md font-medium hover:bg-[var(--button-primary-bg)] hover:text-white transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" className="flex-1 h-10 rounded-md text-white font-medium transition-all duration-200 hover:opacity-90" 
                        style={{backgroundColor: 'var(--button-primary-bg)'}}>
                        Add Bike
                    </button>
                </div>
            </form>

        </div>
      
    </div>
  )
}
