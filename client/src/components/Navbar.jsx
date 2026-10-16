import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowRight, FaBars, FaXmark } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import "../styles/NavbarEditorial.css";

function Navbar() {
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const onDashboard = location.pathname === "/dashboard";
  const profileMatch = location.pathname.match(/^\/([^/]+)\/?$/);
  const reservedPaths = new Set(["login", "signup", "dashboard", "about"]);
  const profilePath = profileMatch && !reservedPaths.has(profileMatch[1].toLowerCase()) ? `/${profileMatch[1]}` : null;

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  if (profilePath || location.pathname === "/login" || location.pathname === "/signup") return null;

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand"><span className="brand-mark"><img src="/linkhub-mark.svg" alt="" /></span><span>linkhub<span className="brand-period">.</span></span></Link>
      <div className={`navbar-links ${menuOpen ? "is-open" : ""}`} id="primary-navigation">
        {onDashboard && token ? <>
          <Link to="/dashboard" className={onDashboard ? "active" : ""} onClick={() => setMenuOpen(false)}>Studio</Link>
          <Link to="/about" className={location.pathname === "/about" ? "active" : ""} onClick={() => setMenuOpen(false)}>About</Link>
        </> : <>
          <Link to="/#features" onClick={() => setMenuOpen(false)}>Why Linkhub</Link>
          <Link to="/about" className={location.pathname === "/about" ? "active" : ""} onClick={() => setMenuOpen(false)}>About</Link>
        </>}
      </div>
      <button type="button" className="nav-menu-toggle" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><span aria-hidden="true">{menuOpen ? <FaXmark /> : <FaBars />}</span></button>
      <div className="navbar-right">
        {onDashboard && token ? <button className="nav-logout" onClick={signOut}>Sign out</button> : !token ? <>
          <Link className="nav-login" to="/login">Log in</Link>
          <Link className="nav-signup" to="/signup">Get started <FaArrowRight /></Link>
        </> : null}
      </div>
    </nav>
  );
}

export default Navbar;
