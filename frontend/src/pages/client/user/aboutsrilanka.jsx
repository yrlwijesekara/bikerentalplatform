import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaMotorcycle, FaCameraRetro, FaMountain, FaUmbrellaBeach, FaLeaf } from "react-icons/fa";
import { MdExplore, MdDirectionsBike } from "react-icons/md";
import Footer from "../../../components/footer";


export default function AboutSriLanka() {
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

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[var(--main-background)] overflow-y-auto scrollbar-hide"
         style={{
           scrollbarWidth: 'none', /* Firefox */
           msOverflowStyle: 'none', /* Internet Explorer 10+ */
         }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      <div className="">
        {/* Hero Section with Auto-Sliding Images */}
        <div className="mb-8">
          <div 
            className="relative h-[70vh] bg-cover bg-center shadow-lg overflow-hidden transition-all duration-1000"
            style={{
              backgroundImage: imagesLoaded 
                ? `url('${heroImages[currentImageIndex]}')`
                : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
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
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Discover the Beauty of Sri Lanka
                </h2>
                <p className="text-lg md:text-xl mb-8 text-gray-200">
                  From tropical beaches to misty mountains, Sri Lanka offers
                  unforgettable travel experiences filled with culture, adventure,
                  and breathtaking landscapes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/places"
                    className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--brand-secondary)',
                      color: 'var(--navbar-text)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--navbar-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand-secondary)'}
                  >
                    <MdExplore size={20} />
                    Explore Destinations
                  </Link>
                  <Link 
                    to="/find-bikes"
                    className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
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
                    <FaMotorcycle size={20} />
                    Rent a Bike
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <div className=" mb-8">
          <div 
            className="p-6"
           
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

        {/* Top Destinations Section */}
        <div className="max-w-7xl mx-auto mb-8">
            <div 
              className="rounded-lg shadow-md border transition-shadow duration-300"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--section-divider)',
                boxShadow: 'var(--shadow-color) 0px 4px 6px -1px'
              }}
            >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Top Destinations
              </h2>
              <p className="text-center text-gray-600">
                Explore the most popular destinations loved by travelers around the world.
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ella Card */}
                <div 
                  className="rounded-lg border hover:shadow-lg transition-shadow duration-300"
                  style={{
                    backgroundColor: 'var(--main-background)',
                    borderColor: 'var(--section-divider)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1549887534-3ec93abae28b"
                    alt="Ella"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMountain className="text-[var(--brand-success)]" size={16} />
                      <h3 className="text-lg font-semibold text-gray-900">Ella</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Famous for mountains, waterfalls, and the Nine Arches Bridge.
                    </p>
                  </div>
                </div>

                {/* Colombo Card */}
                <div 
                  className="rounded-lg border hover:shadow-lg transition-shadow duration-300"
                  style={{
                    backgroundColor: 'var(--main-background)',
                    borderColor: 'var(--section-divider)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96"
                    alt="Colombo"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdExplore className="text-[var(--brand-primary)]" size={16} />
                      <h3 className="text-lg font-semibold text-gray-900">Colombo</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Sri Lanka's bustling capital with modern attractions and rich history.
                    </p>
                  </div>
                </div>

                {/* Galle Card */}
                <div 
                  className="rounded-lg border hover:shadow-lg transition-shadow duration-300"
                  style={{
                    backgroundColor: 'var(--main-background)',
                    borderColor: 'var(--section-divider)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                    alt="Galle"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUmbrellaBeach className="text-[var(--brand-secondary)]" size={16} />
                      <h3 className="text-lg font-semibold text-gray-900">Galle</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Historic coastal city with Dutch colonial architecture and beautiful beaches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Culture & Heritage Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div 
            className=" p-6"
           
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
        <div className=" mb-8">
          <div 
            className=" shadow-md text-white p-8"
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
                <h3 className="text-3xl font-bold mb-1">1300km</h3>
                <p className="text-white/80">Coastline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bike Exploration Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div 
            className="p-6"
            
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MdDirectionsBike className="text-[var(--brand-secondary)]" size={24} />
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] font-semibold rounded-lg hover:bg-[var(--button-primary-hover)] transition-colors duration-200"
                >
                  <FaMotorcycle size={20} />
                  Browse Rental Bikes
                </Link>
              </div>
              <img
                src="/sri lanka/tourist.jpg"
                alt="Bike Travel"
                className="w-full h-88 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="">
          <div 
            className=" shadow-md text-white p-8 text-center"
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
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--navbar-active)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--brand-secondary)'}
              >
                <FaMotorcycle size={20} />
                Find a Bike
              </Link>
              <Link 
                to="/places"
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
      </div>
      <Footer />
    </div>
  );
};


             