

import { BiPlus } from "react-icons/bi";

export default function Bikes() {
  return (
    <div className="w-full h-full ">
        <button className="fixed bottom-10 right-10 flex items-center gap-2 px-4 py-2 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-[var(--button-primary-hover)] cursor-pointer">
            <BiPlus /> Add New Bike</button>
        <h1 className="text-2xl font-bold mt-4">Vendor Bikes Management</h1>
        
    </div>
  )
}