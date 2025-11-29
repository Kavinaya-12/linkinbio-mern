import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicProfile from "./pages/PublicProfile";
import CheckAuth from "./components/CheckAuth";
import Welcome from "./pages/Welcome";
import './styles/global.css';
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/signup" element={<CheckAuth><Signup /></CheckAuth>} />
        <Route path="/login" element={<CheckAuth><Login /></CheckAuth>} />
      <Route path="/dashboard" element={<CheckAuth><Dashboard /></CheckAuth>} />
<Route path="/:username" element={<PublicProfile />} />
<Route path="/about" element={<AboutUs/>}/>
<Route path="/contact" element={<Contact/>}/>       
      </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
    </Router>
  );
}

export default App;



