import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

    
    const data = await res.json();
    if (res.ok) {
      login(data.token);
      setMessage("Login successful ");
    } else {
      setMessage(data.message || "Login failed ");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Welcome Back </h2>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Login;