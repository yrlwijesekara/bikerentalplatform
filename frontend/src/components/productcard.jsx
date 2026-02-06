export default function ProductCard(props) {
  const bike = props.bike;
  return (
    <div className="w-full max-w-[400px] h-auto min-h-[450px] rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col bg-white hover:shadow-xl hover:scale-102 transition-all duration-300 overflow-hidden gap-2">
      <img
        src={
          bike.images && bike.images[0]
            ? bike.images[0]
            : "/placeholder-image.jpg"
        }
        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg mb-3"
      />
      <div className="flex-1 flex flex-col justify-between">
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 line-clamp-2">
          {bike.bikeName || "Unnamed Bike"}
        </h2>
        
        <div className="space-y-2 mb-3">
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Type:</span> {bike.bikeType || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Location:</span> {bike.city || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">Contact:</span> {bike.phoneNumber || "N/A"}
          </p>
        </div>
        
        <div className="mt-auto">
          <p className="text-xl font-bold text-green-600 mb-3">
            ${bike.pricePerDay || 0} <span className="text-sm font-normal text-gray-600">per day</span>
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  );
}
