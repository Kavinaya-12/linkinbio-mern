import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

function Welcome() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-left">
        <h1>Welcome to Link-in-Bio </h1>
        <h2>Your Personal Space, Organized</h2>
        <p>
          Create a beautifully simple profile page to showcase your bio, links,
          and social handles. Control your presence with ease.
        </p>
        <div className="welcome-buttons">
          <button onClick={() => navigate("/signup")} className="primary-btn">Sign Up</button>
          <button onClick={() => navigate("/login")} className="secondary-btn">Login</button>
        </div>
      </div>
      <div className="welcome-right">
        <img
          src="../../public/girl-avatar.png" 
          alt="Illustration"
          className="avatar-illustration"
        />
      </div>
    </div>
  );
}

export default Welcome;
