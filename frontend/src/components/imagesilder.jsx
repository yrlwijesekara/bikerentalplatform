import { useState } from "react";

export default function ImageSlider({ images }) {
    const imageList = images || [];
    const [activeIndex, setActiveIndex] = useState(0);
    
    if (!imageList || imageList.length === 0) {
        return <div className="w-full h-96 flex justify-center items-center rounded-lg" style={{ backgroundColor: 'var(--card-background)', color: '#6B7280' }}>No images available</div>;
    }
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-4 p-4">
            {/* Active Image Display */}
            <div className="w-full max-w-lg h-[600px] flex justify-center items-center rounded-lg overflow-hidden" style={{ backgroundColor: '#F3F4F6', boxShadow: '0 4px 12px var(--shadow-color)' }}>
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
                        className="w-20 h-20 object-cover object-center rounded-lg cursor-pointer shrink-0 hover:opacity-75 hover:scale-105 transform transition-all duration-300"
                        style={{
                            border: index === activeIndex 
                                ? '2px solid var(--brand-primary)' 
                                : '1px solid var(--section-divider)',
                            boxShadow: index === activeIndex 
                                ? '0 4px 8px var(--shadow-color)' 
                                : 'none'
                        }}
                        onClick={() => setActiveIndex(index)}
                        alt={`Thumbnail ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}