import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { login as loginRequest } from "../lib/api";
import FormCard from "../components/FormCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { isValidEmail } from "../lib/validators";

function Login() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const sessionNotice = location.state?.sessionExpired || sessionExpired;

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
    setFieldErrors((current) => ({ ...current, [event.target.name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!isValidEmail(formData.email)) errors.email = "Enter a valid email address.";
    if (!formData.password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setMessage("");
    setIsSubmitting(true);
    try {
      const data = await loginRequest(formData);
      login(data.token, data.user);
      const requestedPath = location.state?.from;
      const path = typeof requestedPath?.pathname === "string" && requestedPath.pathname.startsWith("/") && !requestedPath.pathname.startsWith("//")
        ? `${requestedPath.pathname}${requestedPath.search || ""}${requestedPath.hash || ""}`
        : "/dashboard";
      navigate(path, { replace: true });
    } catch (error) {
      setMessage(error.message || "We couldn't sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Welcome back" subtitle="Sign in to update your page and see how your links are doing." footer={<p className="auth-footer-link">New to Linkhub? <Link to="/signup">Create an account</Link></p>}>
      {sessionNotice && <div className="auth-message" role="status">Your session ended. Sign in again to continue; your unsaved profile draft is kept on this device.</div>}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} onBlur={() => setFieldErrors((current) => ({ ...current, email: isValidEmail(formData.email) ? undefined : "Enter a valid email address." }))} placeholder="you@example.com" disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "login-email-error" : undefined} required />{fieldErrors.email && <span className="auth-field-error" id="login-email-error">{fieldErrors.email}</span>}</div>
        <div className="auth-field"><label htmlFor="login-password">Password</label><div className="auth-input-wrap"><input id="login-password" className="auth-password-input" type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="Your password" disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "login-password-error" : undefined} required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={`${showPassword ? "Hide" : "Show"} password`}><span aria-hidden="true">{showPassword ? <FaEyeSlash /> : <FaEye />}</span></button></div>{fieldErrors.password && <span className="auth-field-error" id="login-password-error">{fieldErrors.password}</span>}</div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner label="Signing you in…" /> : "Sign in"}</button>
      </form>
      {message && <div className="auth-message" role="alert">{message}</div>}
    </FormCard>
  );
}

export default Login;
