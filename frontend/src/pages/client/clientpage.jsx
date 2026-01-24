import { Routes } from "react-router-dom";
import Header from "../../components/header";
import { Route } from "react-router-dom";
import Notfoundpage from "../notfound.jsx";

export default function Clientpage() {
  return (
    <div className="w-full h-screen max-h-screen bg-[#F5F5F5]">
        <Header />
        <Routes path="/">
            <Route path="/" element={<h1 className="text-black">Client Home Page</h1>} />
            <Route path="browse-bikes" element={<h1 className="text-black">Browse Bikes Page</h1>} />
            <Route path="about-sri-lanka" element={<h1 className="text-black">About Sri Lanka Travel Page</h1>} />
            <Route path="/*" element={<Notfoundpage />} />
            
            
        </Routes>
    </div>
  );
}