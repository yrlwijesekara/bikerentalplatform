import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Loginpage from "./pages/loginpage.jsx";
import Registrationpage from "./pages/registrationpage.jsx";
import Adminpage from "./pages/adminpage.jsx";
import Homepage from "./pages/homepage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import Clientpage from "./pages/client/clientpage.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import NotificationCenter from "./components/NotificationCenter.jsx";


function App() {
  return (
    <BrowserRouter>
    <GoogleOAuthProvider clientId= {import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <div className="w-full h-screen">
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #333333',
              },
              success: {
                style: {
                  background: '#1a1a1a',
                  color: '#10b981',
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  background: '#1a1a1a',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                },
              },
              textStyle: {
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "800"
              }
            }}
          />
          
          {/* Global Notification Center */}
          <NotificationCenter />
          
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Loginpage />} />
            <Route path="/register" element={<Registrationpage />} />
            <Route path="/admin/*" element={<Adminpage />} />
            <Route path="/*" element={<Clientpage />} />
          </Routes>
        
        </div>
      </NotificationProvider>
      </GoogleOAuthProvider>;
    </BrowserRouter>
  );
}
export default App;
