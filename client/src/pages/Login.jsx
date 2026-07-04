import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import request from "../lib/api";
import FormCard from "../components/FormCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Login.css";

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const data = await request("/api/auth/login", { method: "POST", body: formData, auth: false });
      login(data.token);
      setMessage("Login successful");
    } catch (error) {
      setMessage(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Welcome Back" subtitle="Sign in to continue managing your profile." footer={<p className="auth-footer-link">New here? <a href="/signup">Create an account</a></p>}>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner label="Signing in..." /> : "Login"}</button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
    </FormCard>
  );
}

export default Login;