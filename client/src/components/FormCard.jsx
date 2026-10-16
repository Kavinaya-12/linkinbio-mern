import { Link } from "react-router-dom";
import "../styles/Auth.css";

const FormCard = ({ title, subtitle, children, footer }) => (
  <main className="auth-page">
    <div className="auth-shell">
      <aside className="auth-story" aria-label="About Linkhub">
        <Link to="/" className="auth-brand"><img src="/linkhub-mark.svg" alt="" /><span>linkhub<span>.</span></span></Link>
        <div className="auth-story-copy">
          <span className="auth-eyebrow">YOUR SPACE, ALL TOGETHER</span>
          <h1>Make room for<br /><span>what you make.</span></h1>
          <p>A calm, considered home for your work, your ideas, and the places you want people to find.</p>
        </div>
        <div className="auth-orbit" aria-hidden="true"><span className="orbit-core">lh</span><i /><i /><i /><span className="orbit-chip orbit-chip-one">Your work</span><span className="orbit-chip orbit-chip-two">Your voice</span><span className="orbit-chip orbit-chip-three">Your links</span></div>
        <span className="auth-story-caption">A little corner of the internet, made yours.</span>
      </aside>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-topline"><span>LINKHUB ACCOUNT</span><Link to="/">Back to home</Link></div>
        <h2 id="auth-title">{title}</h2>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </div>
  </main>
);

export default FormCard;
