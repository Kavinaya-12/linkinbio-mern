import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Signup.css";

function Signup() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
   const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

    const data = await res.json();
    if (res.ok) {
      login(data.token);
      setMessage("Signup successful ");
    } else {
      setMessage(data.message || "Signup failed ");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
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
          <button type="submit">Signup</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default Signup;








