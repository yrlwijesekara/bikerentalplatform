import { useState } from "react";

export default function ImageSlider({ images }) {
    const imageList = images || [];
    const [activeIndex, setActiveIndex] = useState(0);
    
    if (!imageList || imageList.length === 0) {
        return <div className="w-full h-96 bg-gray-200 flex justify-center items-center rounded-lg">No images available</div>;
    }
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-4 p-4">
            {/* Active Image Display */}
            <div className="w-full max-w-lg h-[600px] bg-gray-200 flex justify-center items-center rounded-lg overflow-hidden shadow-lg">
                <img 
                    src={imageList[activeIndex]} 
                    className="w-full h-full object-cover object-center" 
                    alt={`Bike image ${activeIndex + 1}`}
                />
            </div>
            
            {/* Thumbnail Navigation */}
            <div className="flex gap-3 overflow-x-auto justify-center max-w-lg">
                {imageList.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        className={`w-20 h-20 object-cover object-center rounded-lg cursor-pointer shrink-0 ${
                            index === activeIndex 
                                ? 'border-2 border-blue-500 shadow-lg' 
                                : 'border border-gray-300'
                        } hover:opacity-75 hover:scale-105 transform transition-all duration-300`}
                        onClick={() => setActiveIndex(index)}
                        alt={`Thumbnail ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}