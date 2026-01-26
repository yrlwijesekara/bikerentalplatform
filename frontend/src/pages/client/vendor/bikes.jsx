import { BiPlus } from "react-icons/bi";
import { Link } from "react-router-dom";


export default function Bikes() {
  return (
    <div className="w-full  max-h-screen bg-(--main-background) p-6 flex flex-col items-center">
      <Link to="/vendor/add-bike" className="fixed bottom-10 right-10 flex items-center gap-2 px-4 py-2 bg-(--button-primary-bg) text-(--button-primary-text) font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-(--button-primary-hover) cursor-pointer">
        <BiPlus /> Add New Bike
      </Link>
      <h1 className="text-2xl font-bold mt-4">Vendor Bikes</h1>
    </div>
  );
}
