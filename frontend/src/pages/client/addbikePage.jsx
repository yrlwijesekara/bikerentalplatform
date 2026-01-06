import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";


/*

Project URL : https://ztxgzbdttejsjsipqfle.supabase.co

Publishable API Key : sb_publishable_AyZAmP_sugi55THZ-E8GHA_KTbd3S47

*/
const supabaseUrl = 'https://ztxgzbdttejsjsipqfle.supabase.co';
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eGd6YmR0dGVqc2pzaXBxZmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTg0NjAsImV4cCI6MjA4MzI3NDQ2MH0.KivmUbuML4nDfI84Moi_Pj92XiCrXYnj28P7VM_QI4o";


const supabase = createClient(supabaseUrl, key);
export default function AddBikePage() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    async function handleUpload() {
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setUploading(true);
        
        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            // Upload file to Supabase storage
            const { data, error } = await supabase.storage
                .from("bikes")
                .upload(`public/${fileName}`, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("bikes")
                .getPublicUrl(`public/${fileName}`);

            setImageUrl(urlData.publicUrl);
            toast.success("File uploaded successfully!");
            setFile(null);

        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error(`Error uploading file: ${error.message}`);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-100 p-8">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add Bike Image</h2>
                
                <div className="mb-4">
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setFile(e.target.files[0]);
                            console.log(e.target.files[0]);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={uploading}
                    />
                </div>
                
                {file && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Selected: {file.name}</p>
                        <p className="text-xs text-gray-500">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                )}

                <button 
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? "Uploading..." : "Upload Image"}
                </button>

                {imageUrl && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Uploaded Image:</h3>
                        <img 
                            src={imageUrl} 
                            alt="Uploaded bike" 
                            className="w-full h-48 object-cover rounded-md border"
                        />
                        <p className="text-xs text-gray-500 mt-2 break-all">{imageUrl}</p>
                    </div>
                )}
            </div>
        </div>
    );
}