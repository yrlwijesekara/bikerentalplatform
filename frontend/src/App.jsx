import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/homepage.jsx";
import Loginpage from "./pages/loginpage.jsx";
import Registrationpage from "./pages/registrationpage.jsx";
import Adminpage from "./pages/adminpage.jsx";
import Notfoundpage from "./pages/notfound.jsx";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <BrowserRouter>
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
          <Routes path="/">
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Loginpage />} />
            <Route path="/register" element={<Registrationpage />} />
            <Route path="/admin/*" element={<Adminpage />} />
            <Route path="/*" element={<Notfoundpage />} />
          </Routes>
        
      </div>
    </BrowserRouter>
  );
}
export default App;
