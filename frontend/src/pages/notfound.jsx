import { Link } from "react-router-dom";
import { HiHome, HiArrowLeft } from "react-icons/hi";
import { GiFullMotorcycleHelmet } from "react-icons/gi";

export default function Notfoundpage() {
    return (
        <div className="w-full h-screen overflow-hidden"
             style={{
               scrollbarWidth: 'none',
               msOverflowStyle: 'none',
             }}>
            <style>{`
                *::-webkit-scrollbar {
                    display: none;
                }
                html, body {
                    overflow: hidden;
                }
            `}</style>
            
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full text-center">
                    {/* 404 Number */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse leading-none">
                            404
                        </h1>
                    </div>

                    {/* Error Message */}
                    <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 px-2">
                            Oops! Page Not Found
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg mx-auto px-4 leading-relaxed">
                            The page you're looking for doesn't exist or has been moved. 
                            Let's get you back on track!
                        </p>
                    </div>

                    {/* Illustration */}
                    <div className="mb-8 sm:mb-12">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 animate-bounce flex items-center justify-center">
                            <GiFullMotorcycleHelmet className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                        <Link 
                            to="/" 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                        >
                            <HiHome className="text-xl sm:text-2xl" />
                            Go to Home
                        </Link>
                        <button 
                            onClick={() => window.history.back()} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 border-gray-200 text-sm sm:text-base"
                        >
                            <HiArrowLeft className="text-xl sm:text-2xl" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}