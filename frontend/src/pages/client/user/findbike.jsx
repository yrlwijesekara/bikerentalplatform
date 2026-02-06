import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Loader from '../../../components/loader';
import ProductCard from '../../../components/productcard';
export default function Findbike() {

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      axios.get(import.meta.env.VITE_BACKEND_URL + '/products/')
        .then(response => {
          setBikes(response.data.products || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching bikes:', error);
          setBikes([]);
          setLoading(false);
        })
    }
  }, [loading]);
  return (
    <div className="w-full min-h-[calc(100vh-80px)] pt-4 pb-16">
      {
        loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader />
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Find Your Perfect Bike
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Discover amazing bikes available for rent
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {
                bikes.length > 0 ? (
                  bikes.map((bike) => (
                    <div key={bike._id} className="w-full max-w-sm">
                      <ProductCard bike={bike} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bikes available</h3>
                    <p className="text-gray-500">Check back later for new listings.</p>
                  </div>
                )
              }
            </div>
          </div>
        )
      }
    </div>
  )
}