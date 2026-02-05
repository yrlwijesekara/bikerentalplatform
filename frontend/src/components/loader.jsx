import { GiFullMotorcycleHelmet } from "react-icons/gi";

export default function Loader() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative">
                {/* Rotating outer ring */}
                <div className="w-20 h-20 border-4 border-transparent border-t-[var(--brand-primary)] border-r-[var(--brand-primary)] rounded-full animate-spin"></div>
                
                {/* Rotating inner ring (opposite direction) */}
                <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-amber-600 border-l-amber-600 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
                
                {/* Motorcycle helmet in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <GiFullMotorcycleHelmet className="text-3xl text-[var(--brand-primary)] animate-pulse" />
                </div>
                
                {/* Rotating dots around */}
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '3s'}}>
                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full bottom-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full left-0 top-1/2 transform -translate-y-1/2"></div>
                    <div className="absolute w-2 h-2 bg-amber-500 rounded-full right-0 top-1/2 transform -translate-y-1/2"></div>
                </div>
            </div>
        </div>
    );
}