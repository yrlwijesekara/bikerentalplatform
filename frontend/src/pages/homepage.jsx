import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt, FaMotorcycle, FaCameraRetro, FaMountain, FaUmbrellaBeach, FaLeaf } from "react-icons/fa";
import { MdExplore, MdDirectionsBike } from "react-icons/md";
import Header from "../components/header";
import Footer from "../components/footer";
import ProductCard from "../components/productcard";
import PlaceCard from "../components/placecard";
import axios from "axios";

export default function Homepage() {
  const navigate = useNavigate();

  // Sri Lanka images for hero slideshow
  const heroImages = [
    "/sri lanka/pic1.jpg",
    "/sri lanka/pic2.jpg",
    "/sri lanka/pic3.jpg",
    "/sri lanka/pic7.jpg",
    "/sri lanka/pic5.jpg",
    "/sri lanka/pic8.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [randomBikes, setRandomBikes] = useState([]);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and redirect based on role
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      // Redirect based on user role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "vendor":
          navigate("/vendor/dashboard");
          break;
        case "user":
          // Users can stay on homepage instead of auto-redirecting to find-bikes
          break;
        default:
          // If role is invalid, clear localStorage and stay on homepage
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          break;
      }
    }
  }, [navigate]);

  // Preload images to ensure they're cached
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading hero images:", error);
        setImagesLoaded(true); // Still show the page even if images fail
      }
    };

    preloadImages();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!imagesLoaded) return; // Don't start cycling until images are loaded
    
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % heroImages.length
      );
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, [heroImages.length, imagesLoaded]);

  // Function to fetch bikes from the API
  const fetchBikes = async () => {
    try {
      setBikesLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/available`);
      
      // With axios, the data is automatically parsed and available in response.data
      return response.data.products || [];
    } catch (error) {
      console.error("Error fetching bikes:", error);
      return [];
    } finally {
      setBikesLoading(false);
    }
  };

  // Function to select 3 random bikes
  const getRandomBikes = (bikes) => {
    if (bikes.length <= 3) {
      return bikes;
    }
    
    const shuffled = [...bikes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Function to fetch and set random bikes with localStorage persistence
  const fetchAndSetRandomBikes = async () => {
    const bikes = await fetchBikes();
    const randomSelection = getRandomBikes(bikes);
    const timestamp = Date.now();
    
    // Store in localStorage with timestamp
    localStorage.setItem('homepageBikes', JSON.stringify({
      bikes: randomSelection,
      timestamp: timestamp
    }));
    
    setRandomBikes(randomSelection);
  };

  // Function to check if we need to refresh bikes (2 minutes = 120000ms)
  const shouldRefreshBikes = () => {
    const cached = localStorage.getItem('homepageBikes');
    if (!cached) return true;
    
    try {
      const { timestamp } = JSON.parse(cached);
      const now = Date.now();
      const twoMinutes = 120000; // 2 minutes in milliseconds
      
      return (now - timestamp) >= twoMinutes;
    } catch (error) {
      console.error('Error parsing cached bikes:', error);
      return true;
    }
  };

  // Function to load bikes from cache or fetch new ones
  const loadBikes = async () => {
    const cached = localStorage.getItem('homepageBikes');
    
    if (cached && !shouldRefreshBikes()) {
      // Load from cache
      try {
        const { bikes } = JSON.parse(cached);
        setRandomBikes(bikes);
        return;
      } catch (error) {
        console.error('Error loading cached bikes:', error);
      }
    }
    
    // Fetch new bikes if cache is empty, invalid, or expired
    await fetchAndSetRandomBikes();
  };

  // Setup bikes loading and interval timer
  useEffect(() => {
    loadBikes();

    // Function to check and refresh bikes
    const checkAndRefresh = () => {
      if (shouldRefreshBikes()) {
        fetchAndSetRandomBikes();
      }
    };

    // Check every 10 seconds if we need to refresh (more responsive than waiting full 2 minutes)
    const interval = setInterval(checkAndRefresh, 10000);

    return () => clearInterval(interval);
  }, []);

  // Function to fetch places from the API
  const fetchPlaces = async () => {
    try {
      setPlacesLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/places`);
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    } finally {
      setPlacesLoading(false);
    }
  };

  // Function to get 3 featured places
  const getFeaturedPlaces = (places) => {
    const featured = places.filter(place => place.isFeatured === true);
    return featured.slice(0, 3);
  };

  // Function to fetch and set featured places
  const fetchAndSetFeaturedPlaces = async () => {
    const places = await fetchPlaces();
    const featuredSelection = getFeaturedPlaces(places);
    setFeaturedPlaces(featuredSelection);
  };

  // Fetch featured places on component mount
  useEffect(() => {
    fetchAndSetFeaturedPlaces();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[var(--main-background)] flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <style>{`
          div::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
        `}</style>
        
        {/* Hero Section with Auto-Sliding Images */}
        <div className="mb-8">
          <div 
            className="relative h-[70vh] bg-cover bg-center shadow-lg overflow-hidden transition-all duration-1000"
            style={{
              backgroundImage: imagesLoaded 
                ? `url('${heroImages[currentImageIndex]}')`
                : 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Image Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="relative h-full flex items-center justify-center text-white">
              <div className="text-center max-w-3xl px-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Discover the Beauty of Sri Lanka
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200">
                  From tropical beaches to misty mountains, Sri Lanka offers
                  unforgettable travel experiences filled with culture, adventure,
                  and breathtaking landscapes. Rent a bike and explore at your own pace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/find-bikes"
                    className="inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--brand-secondary)',
                      color: 'var(--navbar-text)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--navbar-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand-secondary)'}
                  >
                    <FaMotorcycle size={20} />
                    Find Bikes Near You
                  </Link>
                  <Link 
                    to="/destinations"
                    className="inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--navbar-bg)',
                      border: '2px solid var(--section-divider)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--main-background)';
                      e.target.style.borderColor = 'var(--brand-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--card-background)';
                      e.target.style.borderColor = 'var(--section-divider)';
                    }}
                  >
                    <MdExplore size={20} />
                    Explore Sri Lanka
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <div 
            className="p-6 rounded-lg "
           
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <img 
                  src="/sri lanka/flag.png" 
                  alt="Sri Lanka Flag" 
                  className="w-full max-w-md h-48 md:h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" 
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">About Sri Lanka</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sri Lanka, known as the Pearl of the Indian Ocean, is one of the most
                  diverse travel destinations in the world. The island offers stunning
                  beaches, ancient temples, wildlife safaris, tea plantations, and
                  vibrant cultural traditions. Visitors can experience historical
                  kingdoms, colorful festivals, and world-famous Sri Lankan hospitality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Bikes Section */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <div 
            className="rounded-lg "
            
          >
            <div className="p-6 border-b" style={{ borderColor: 'var(--section-divider)' }}>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Featured Bikes for Rent
              </h2>
              <p className="text-center text-gray-600">
                Discover these amazing bikes available for rent. Perfect for exploring Sri Lanka at your own pace.
              </p>
            </div>
            
            <div className="p-6">
              {bikesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading bikes...</span>
                </div>
              ) : randomBikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {randomBikes.map((bike) => (
                    <ProductCard key={bike._id} bike={bike} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaMotorcycle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No bikes available at the moment. Check back soon!</p>
                  <Link 
                    to="/find-bikes"
                    className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Browse All Bikes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Destinations Section */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <div 
            className="rounded-lg "
           
          >
            <div className="p-6 border-b" style={{ borderColor: 'var(--section-divider)' }}>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Featured Destinations
              </h2>
              <p className="text-center text-gray-600">
                Discover our handpicked featured destinations across Sri Lanka.
              </p>
            </div>
            
            <div className="p-6">
              {placesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading destinations...</span>
                </div>
              ) : featuredPlaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPlaces.map((place) => (
                    <PlaceCard key={place._id} place={place} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaMapMarkerAlt size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No featured destinations available at the moment.</p>
                  <Link 
                    to="/destinations"
                    className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Browse All Destinations
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Culture & Heritage Section */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <div 
            className="p-6 rounded-lg "
          
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <img
                src="/sri lanka/dance.jpg"
                alt="Sri Lankan Culture"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Rich Culture & Heritage
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Sri Lanka has a cultural history that spans more than 2,500 years.
                  The island is home to ancient kingdoms, sacred temples, colorful
                  festivals, and traditional dances. Events such as the Kandy Esala
                  Perahera showcase Sri Lanka's deep cultural heritage through music,
                  costumes, and religious rituals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tourism Statistics Section */}
        <div className="mb-8 ">
          <div 
            className="shadow-md text-white p-8 "
            style={{
              background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)`,
              boxShadow: 'var(--shadow-color) 0px 4px 6px -1px'
            }}
          >
            <h2 className="text-2xl font-bold text-center mb-8">Sri Lanka by the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-1">2M+</h3>
                <p className="text-white/80">Annual Tourists</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-1">8</h3>
                <p className="text-white/80">UNESCO Heritage Sites</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-1">26</h3>
                <p className="text-white/80">National Parks</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-1">1300km+</h3>
                <p className="text-white/80">Coastline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bike Exploration Section */}
        <div className="max-w-7xl mx-auto mb-8 px-6">
          <div 
            className="p-6 rounded-lg "
           
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MdDirectionsBike style={{ color: 'var(--brand-secondary)' }} size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Explore Sri Lanka on Two Wheels
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Motorbike travel is one of the best ways to explore Sri Lanka's
                  scenic roads, coastal routes, and mountain landscapes. Our platform
                  helps travelers find reliable bikes and trusted vendors across the
                  island so they can travel freely and experience the beauty of Sri
                  Lanka.
                </p>
                <Link 
                  to="/find-bikes"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-text)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}
                >
                  <FaMotorcycle size={20} />
                  Browse Rental Bikes
                </Link>
              </div>
              <img
                src="/sri lanka/tourist.jpg"
                alt="Bike Travel"
                className="w-full h-84 object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className=" ">
          <div 
            className="shadow-md text-white p-8 text-center"
            style={{
              background: `linear-gradient(135deg, var(--navbar-bg) 0%, var(--navbar-hover) 100%)`,
              boxShadow: 'var(--shadow-color) 0px 4px 6px -1px'
            }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Start Your Sri Lankan Adventure Today
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Rent a bike and explore the most beautiful destinations across Sri
              Lanka. Experience the freedom of discovering hidden gems at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/find-bikes"
                className="inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--brand-secondary)',
                  color: 'var(--navbar-text)'
                }}
                 onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--navbar-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand-secondary)'}
              >
                <FaMotorcycle size={20} />
                Find a Bike
              </Link>
              <Link 
                to="/destinations"
                className="inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--navbar-bg)',
                  border: '2px solid var(--section-divider)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--main-background)';
                  e.target.style.borderColor = 'var(--brand-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--card-background)';
                  e.target.style.borderColor = 'var(--section-divider)';
                }}
              >
                <FaMapMarkerAlt size={20} />
                Explore Places
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
