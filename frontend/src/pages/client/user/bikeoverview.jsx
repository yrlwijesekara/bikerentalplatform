import axios from "axios";
import { use } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../../../components/loader";
export default function BikeOverview()   {

    const params = useParams();
    const [bike, setBike] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if(status === "loading") {
            axios.get(import.meta.env.VITE_BACKEND_URL + `/products/${params.bikeid}`)
            .then(response => {
                setBike(response.data.product);
                toast.success("Bike details fetched successfully");
                setStatus("success");
            })
            .catch(error => {
                toast.error("Error fetching bike details");
                console.error("Error fetching bike details:", error);
                setStatus("error");
            });

        }
    }, [status, params.bikeid]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            {status === "loading" && <Loader />}
            {status === "success" && bike && (
                <div className="w-full h-full flex flex-row items-start justify-center gap-8 p-6">
                    <div> </div>
                    
                </div>
            )}
            {status === "error" && (
                <div className="w-full max-w-3xl bg-red-100 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-red-600">Error loading bike details</h2>
                </div>
            )}
        </div>
    );
}