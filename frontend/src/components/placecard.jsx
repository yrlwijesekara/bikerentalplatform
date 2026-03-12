import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaTag } from "react-icons/fa";
import { FaUmbrellaBeach, FaMountain, FaMonument, FaWater, FaPaw, FaChurch} from "react-icons/fa";
import { CiStar } from "react-icons/ci";



export default function PlaceCard(props) {
  const place = props.place;
  const navigate = useNavigate();

  // Early return if place is not available
  if (!place) {
    return (
      <div className="w-full max-w-[400px] h-auto min-h-[450px] rounded-xl shadow-lg border border-gray-200 p-4 flex items-center justify-center bg-white">
        <p className="text-gray-500">Place data not available</p>
      </div>
    );
  }

  // Get category icon with safe fallback
  const getCategoryIcon = (category) => {
    if (!category) return <FaMapMarkerAlt />;
    
    switch (category) {
      case "Beach": return <FaUmbrellaBeach />;
      case "Mountain": return <FaMountain />;
      case "Historical": return <FaMonument />;
      case "Waterfall": return <FaWater />;
      case "Wildlife": return <FaPaw />;
      case "Religious": return <FaChurch />;
      case "Scenic": return <FaMountain />;
      default: return <FaMapMarkerAlt />;
    }
  };

  return (
    <div className="w-full max-w-[400px] h-auto min-h-[450px] rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col bg-white hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden gap-2">
      <div className="relative w-full h-48 sm:h-56 lg:h-64 rounded-lg mb-3">
        <img
          src={
            place.image && Array.isArray(place.image) && place.image.length > 0
              ? place.image[0]
              : "/placeholder-image.jpg"
          }
          alt={place.name || "Place"}
          className="w-full h-full object-cover rounded-lg cursor-pointer"
          onClick={() => {
            if (place._id) {
              navigate(`/place-details/${place._id}`);
            }
          }}
        />
        {place.isFeatured && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 bg-opacity-80 backdrop-blur-sm">
              <CiStar /> Featured
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-2xl">{getCategoryIcon(place.category)}</span>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {place.name || "Unnamed Place"}
          </h2>
        </div>
        
        <div className="space-y-2 mb-3">
          <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
            <FaTag className="text-blue-500" size={14} />
            <span className="font-medium">Category:</span> {place.category || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" size={14} />
            <span className="font-medium">Location:</span> {place.city || "Unknown"}, {place.district || "Unknown"}
          </p>
          {place.openingHours && (
            <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
              <FaClock className="text-green-500" size={14} />
              <span className="font-medium">Hours:</span> {place.openingHours}
            </p>
          )}
          {place.entranceFee && (
            <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
              <FaMoneyBillWave className="text-yellow-500" size={14} />
              <span className="font-medium">Fee:</span> {place.entranceFee}
            </p>
          )}
        </div>
        
        
        
        
        
        <div className="mt-auto">
          <button 
            className="w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--button-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--button-primary-bg)';
            }}
            onClick={() => {
              if (place._id) {
                navigate(`/place-details/${place._id}`);
              }
            }}
          >
            Explore Place
          </button>
        </div>
      </div>
    </div>
  );
}