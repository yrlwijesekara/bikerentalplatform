import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/homepage.jsx";
import Loginpage from "./pages/loginpage.jsx";
import Registrationpage from "./pages/registrationpage.jsx";
import Adminpage from "./pages/adminpage.jsx";
import Notfoundpage from "./pages/notfound.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        l
        <div>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Loginpage />} />
            <Route path="/register" element={<Registrationpage />} />
            <Route path="/admin" element={<Adminpage />} />
            <Route path="/*" element={<Notfoundpage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
