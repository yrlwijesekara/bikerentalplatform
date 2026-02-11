import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Homepage() {
  const navigate = useNavigate();

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

  return (
    <div className="w-full min-h-screen bg-[var(--main-background)] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--brand-primary)] mb-6">
            Welcome to BikeRental Sri Lanka
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-primary)] mb-8 leading-relaxed">
            Discover the beautiful island of Sri Lanka on two wheels. 
            Rent the perfect bike for your adventure and explore at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/find-bikes")}
              className="px-8 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-semibold hover:bg-[var(--brand-secondary)] transition-colors"
            >
              Find Bikes Near You
            </button>
            <button 
              onClick={() => navigate("/about-sri-lanka")}
              className="px-8 py-3 border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-lg font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
            >
              Explore Sri Lanka
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
