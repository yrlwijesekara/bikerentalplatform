import { Link } from "react-router-dom";
import { HiHome, HiArrowLeft } from "react-icons/hi";

export default function Notfoundpage() {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">
                        404
                    </h1>
                </div>

                {/* Error Message */}
                <div className="mb-8 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
                        The page you're looking for doesn't exist or has been moved. 
                        Let's get you back on track!
                    </p>
                </div>

                {/* Illustration */}
                <div className="mb-12">
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        <HiHome className="text-2xl" />
                        Go to Home
                    </Link>
                    <button 
                        onClick={() => window.history.back()} 
                        className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 border-gray-200"
                    >
                        <HiArrowLeft className="text-2xl" />
                        Go Back
                    </button>
                </div>

               
            </div>
        </div>
    );
}