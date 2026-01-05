import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Loginpage() {
  const backgroundImages = [
    "bg-[url(./loginbg3.jpg)]",
    "bg-[url(./loginbg4.jpg)]",
    "bg-[url(./loginbg2.jpg)]",
  ];

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login() {
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
      console.log("Login successful:", response.data );
      toast.success("Login successful! Welcome back.");
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else if (response.data.user.role === "vendor" || response.data.user.role === "users") {
        navigate("/");
      }
      localStorage.setItem('token', response.data.token);
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
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 20000); // Change every 20 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div
      className={`w-full h-screen ${backgroundImages[currentBgIndex]} bg-cover bg-center flex justify-center items-center transition-all duration-1000`}
    >
      <div className="w-[500px] h-[600px] backdrop-blur-lg shadow-2xl rounded-2xl text-amber-100 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-center mb-10">Login Page</h1>

        <div className="w-full flex flex-col justify-center items-center gap-6">
          <input 
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            value={email}
            className="w-[350px] h-[60px] rounded-md p-4 text-white bg-transparent border-2 border-hidden border-amber-300 outline-none transition-all duration-300 hover:border-amber-200 hover:scale-105 focus:border-amber-100 focus:shadow-lg focus:shadow-amber-200/50 placeholder-amber-200"
          />

          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            value={password}
            className="w-[350px] h-[60px] rounded-md p-4 text-white bg-transparent border-2 border-hidden border-amber-300 outline-none transition-all duration-300 hover:border-amber-200 hover:scale-105 focus:border-amber-100 focus:shadow-lg focus:shadow-amber-200/50 placeholder-amber-200"
          />

          <button 
            onClick={login}
            disabled={loading}
            className="w-[350px] h-[60px] rounded-md bg-amber-600 text-white font-bold text-xl transition-all duration-300 hover:bg-amber-500 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-amber-100">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-300 hover:underline hover:text-amber-100"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

