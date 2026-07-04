import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import request from "../lib/api";
import FormCard from "../components/FormCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Signup.css";

function Signup() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const data = await request("/api/auth/signup", { method: "POST", body: formData, auth: false });
      login(data.token);
      setMessage("Signup successful");
    } catch (error) {
      setMessage(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Create Account" subtitle="Set up your public profile in minutes." footer={<p className="auth-footer-link">Already have an account? <a href="/login">Log in</a></p>}>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner label="Creating account..." /> : "Signup"}</button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
    </FormCard>
  );
}

export default Signup;