import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Registrationpage() {
  const backgroundImages = [
    "bg-[url(./loginbg3.jpg)]",
    "bg-[url(./loginbg4.jpg)]",
    "bg-[url(./loginbg2.jpg)]",
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { firstname, lastname, email, password, confirmPassword, phone, address, city } = formData;
    
    if (!firstname || !lastname || !email || !password || !confirmPassword || !phone || !address || !city) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) ) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      toast.error("Please enter a valid phone number (at least 10 digits).");
      return false;
    }

    return true;
  };

  async function register() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log("Registration data:", formData);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/`, registrationData);
      
      console.log("Registration successful:", response.data);
      toast.success("Registration successful! Please login with your credentials.");
      
      // Clear form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        city: "",
        role: "user"
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Registration failed:", error);
      
      // Check for duplicate email error
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Registration failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('exists')) {
        toast.error("Already registration with this email. Please use a different email or try logging in.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 20000); // Change every 20 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div
      className={`w-full min-h-screen ${backgroundImages[currentBgIndex]} bg-cover bg-center flex justify-center items-center transition-all duration-1000 p-4 sm:p-6 lg:p-8`}
    >
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl backdrop-blur-xl bg-white/20 shadow-2xl rounded-2xl border border-white/30 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 my-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-7 lg:mb-8 text-[var(--brand-primary)]">
          Create Account
        </h1>

        <div className="w-full flex flex-col justify-center items-center gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px]">
            <input 
              name="firstname"
              onChange={handleInputChange}
              type="text"
              placeholder="First Name"
              value={formData.firstname}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />

            <input 
              name="lastname"
              onChange={handleInputChange}
              type="text"
              placeholder="Last Name"
              value={formData.lastname}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          <input 
            name="email"
            onChange={handleInputChange}
            type="email"
            placeholder="Email Address"
            value={formData.email}
            className="w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px] h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
          />

          <input 
            name="phone"
            onChange={handleInputChange}
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            className="w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px] h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px]">
            <input 
              name="address"
              onChange={handleInputChange}
              type="text"
              placeholder="Address"
              value={formData.address}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />

            <input 
              name="city"
              onChange={handleInputChange}
              type="text"
              placeholder="City"
              value={formData.city}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px]">
            <input
              name="password"
              onChange={handleInputChange}
              type="password"
              placeholder="Password"
              value={formData.password}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />

            <input
              name="confirmPassword"
              onChange={handleInputChange}
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              className="w-full h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          <select
            name="role"
            onChange={handleInputChange}
            value={formData.role}
            className="w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px] h-[45px] sm:h-[48px] lg:h-[50px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] text-sm sm:text-base"
          >
            <option value="user" className="bg-[var(--card-background)] text-gray-800">Customer</option>
            <option value="vendor" className="bg-[var(--card-background)] text-gray-800">Bike Owner</option>
          </select>

          <button 
            onClick={register}
            disabled={loading}
            className="w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[450px] h-[45px] sm:h-[48px] lg:h-[50px] rounded-md text-white flex justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base mt-2"
            style={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-white text-sm sm:text-base text-center mt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[var(--brand-primary)] hover:underline hover:text-[var(--brand-secondary)] font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
