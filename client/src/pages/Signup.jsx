import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { signup as signupRequest } from "../lib/api";
import FormCard from "../components/FormCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPasswordStrength, isValidEmail, isValidPassword, isValidUsername } from "../lib/validators";

const validate = (values) => {
  const errors = {};
  if (!isValidUsername(values.username)) errors.username = "Use 3–20 lowercase letters, numbers, or underscores.";
  if (!isValidEmail(values.email)) errors.email = "Enter a valid email address.";
  if (!isValidPassword(values.password)) errors.password = "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Your passwords do not match.";
  return errors;
};

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...formData, [name]: name === "username" ? value.toLowerCase().replace(/\s+/g, "") : value };
    setFormData(next);
    setMessage("");
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined, ...(name === "password" ? { confirmPassword: undefined } : {}) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setMessage("");
    setIsSubmitting(true);
    try {
      const data = await signupRequest({ username: formData.username, email: formData.email, password: formData.password });
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message || "We couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name, label, type, autocomplete, placeholder, toggle) => {
    const passwordVisible = name === "password" ? showPassword : showConfirmation;
    return (
    <div className="auth-field">
      <label htmlFor={`signup-${name}`}>{label}</label>
      <div className="auth-input-wrap">
        <input id={`signup-${name}`} className={toggle ? "auth-password-input" : ""} type={toggle ? (passwordVisible ? "text" : "password") : type} name={name} autoComplete={autocomplete} value={formData[name]} onChange={handleChange} onBlur={() => setFieldErrors((current) => ({ ...current, [name]: validate(formData)[name] }))} placeholder={placeholder} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name] ? `signup-${name}-error` : undefined} required />
        {toggle && <button type="button" className="auth-password-toggle" onClick={() => name === "password" ? setShowPassword((value) => !value) : setShowConfirmation((value) => !value)} aria-label={`${passwordVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}><span aria-hidden="true">{passwordVisible ? <FaEyeSlash /> : <FaEye />}</span></button>}
      </div>
      {fieldErrors[name] && <span className="auth-field-error" id={`signup-${name}-error`}>{fieldErrors[name]}</span>}
    </div>
    );
  };

  return (
    <FormCard title="Create your account" subtitle="Choose a name for your page and bring all your links together." footer={<p className="auth-footer-link">Already have an account? <Link to="/login">Sign in</Link></p>}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {field("username", "Username", "text", "username", "yourname")}
        {field("email", "Email address", "email", "email", "you@example.com")}
        {field("password", "Password", "password", "new-password", "Create a strong password", true)}
        {formData.password && <div className="password-strength" aria-live="polite"><span className="password-strength-meter" aria-hidden="true">{[1, 2, 3, 4, 5].map((level) => <i key={level} className={passwordStrength >= level ? "active" : ""} />)}</span><span>{passwordStrength === 5 ? "Meets password requirements" : "Add uppercase, lowercase, a number and a symbol"}</span></div>}
        {field("confirmPassword", "Confirm password", "password", "new-password", "Enter your password again", true)}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner label="Creating your account…" /> : "Create account"}</button>
      </form>
      {message && <div className="auth-message" role="alert">{message}</div>}
    </FormCard>
  );
}

export default Signup;
