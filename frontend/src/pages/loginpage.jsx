import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";


export default function Loginpage() {
  const backgroundImages = [
    "/loginbg3.jpg",
    "/loginbg4.jpg", 
    "/loginbg2.jpg",
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googlelogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/users/google-login`,
          { accessToken: tokenResponse.access_token }
        );

        toast.success(`Login successful! Welcome back, ${response.data.user.firstname}`);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "Google login failed. Please try again.";
        toast.error(errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      toast.error("Google login failed. Please try again.");
    }
  });

  // Preload images to ensure they're cached
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgroundImages.map((src) => {
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
        console.error("Error preloading images:", error);
        setImagesLoaded(true); // Still show the page even if images fail
      }
    };

    preloadImages();
  }, []);

  async function login(e) {
    e.preventDefault(); // Prevent form submission
    
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    console.log(email, password);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/login`, { 
        email, 
        password 
      });
      
      // Log login success without exposing the token
      console.log("Login successful:", {
        message: response.data.message,
        user: response.data.user,
        tokenReceived: !!response.data.token // Just confirm token was received
      });
      
      toast.success(`Login successful! Welcome back, ${response.data.user.firstname}`);
      
      // Store token and role in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else if (response.data.user.role === "vendor" || response.data.user.role === "user") {
        navigate("/");
      }
      // You can redirect to dashboard here
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!imagesLoaded) return; // Don't start cycling until images are loaded
    
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 20000); // Change every 20 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length, imagesLoaded]);

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex justify-center items-center transition-all duration-1000 p-4 sm:p-6 lg:p-8"
      style={{
        backgroundImage: imagesLoaded 
          ? `url('${backgroundImages[currentBgIndex]}')` 
          : 'linear-gradient(135deg, #0A2540 0%, #1F3C88 100%)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl backdrop-blur-xl bg-white/20 shadow-2xl rounded-2xl border border-white/30 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 min-h-[500px] sm:min-h-[600px]">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-10 text-[var(--brand-primary)]">
          Login Page
        </h1>

        <form onSubmit={login} className="w-full flex flex-col justify-center items-center gap-4 sm:gap-5 lg:gap-6">
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            required
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] h-[50px] sm:h-[55px] lg:h-[60px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
          />

          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            required
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] h-[50px] sm:h-[55px] lg:h-[60px] rounded-md p-3 sm:p-4 text-gray-800 bg-[var(--card-background)] border-2 border-[var(--section-divider)] outline-none transition-all duration-300 hover:border-[var(--brand-primary)] hover:scale-[1.02] focus:border-[var(--brand-primary)] focus:shadow-lg focus:shadow-[var(--shadow-color)] placeholder-gray-500 text-sm sm:text-base"
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] h-[50px] sm:h-[55px] lg:h-[60px] rounded-md text-white flex justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-hover)')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'var(--button-primary-bg)')}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button 
           type="button"
           onClick={() => googlelogin()}
           disabled={googleLoading}
           className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] h-[50px] sm:h-[55px] lg:h-[60px] rounded-md border border-gray-300 bg-white text-gray-900 font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <img src="/image.png" alt="Google Icon" className="h-5 w-5" />
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <p className="text-white text-sm sm:text-base text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[var(--brand-primary)] hover:underline hover:text-[var(--brand-secondary)] font-medium"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

