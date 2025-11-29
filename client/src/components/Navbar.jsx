import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaSignInAlt, FaSignOutAlt, FaHome, FaUserPlus } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  const { token, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FaHome className="navbar-icon" />
        <Link to="/" className="navbar-title">LinkHub</Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        { token && <Link to="/contact" className={location.pathname=== "/contact" ? "active" : ""}> Contact </Link>}
{token && <Link to="/about" className={location.pathname === "/about" ? "active " :""}>About Us</Link>
}  
        {token && <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>Dashboard</Link>}
    </div>

      <div className="navbar-right">
        {!token ? (
          <>
            <Link to="/login"><FaSignInAlt /> Login</Link>
            <Link to="/signup"><FaUserPlus /> Signup</Link>
          </>
        ) : (
          <button className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
