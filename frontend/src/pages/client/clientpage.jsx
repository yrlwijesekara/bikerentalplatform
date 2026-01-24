import { Routes } from "react-router-dom";
import Header from "../../components/header";

export default function Clientpage() {
  return (
    <div className="w-full h-screen max-h-screen bg-[#F5F5F5]">
        <Header />
        <Routes>
            {/* Define client-specific routes here */}
        </Routes>
    </div>
  );
}