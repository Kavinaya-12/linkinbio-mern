import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowDown, FaArrowUpRightFromSquare, FaRegCircleCheck } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import "../styles/Welcome.css";
import "../styles/WelcomeEditorial.css";

function Welcome() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    document.title = "Linkhub — your links, in one place";
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  if (token) return null;

  return (
    <main className="welcome-page">
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR LITTLE CORNER OF THE INTERNET</span>
          <h1>Everything you make,<br /><em>in one place.</em></h1>
          <p>Bring your public links and a short introduction together in a profile that is easy to share and simple to update.</p>
          <div className="welcome-actions"><Link to="/signup" className="hero-cta">Build your page <FaArrowUpRightFromSquare /></Link><Link to="/login" className="hero-secondary">I already have an account <span aria-hidden="true">↗</span></Link></div>
          <div className="hero-proof"><FaRegCircleCheck /> Your links stay yours <span>·</span> Preview before publishing</div>
        </div>
        <div className="hero-art" aria-label="An abstract preview of a Linkhub profile">
          <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
          <div className="editorial-preview-card">
            <div className="editorial-preview-top"><span>PROFILE / PREVIEW</span><span>01</span></div>
            <div className="editorial-preview-rule" />
            <div className="editorial-preview-body"><div className="editorial-avatar-placeholder" aria-hidden="true">L</div><span className="editorial-preview-kicker">A PAGE OF YOUR OWN</span><strong>Your introduction.</strong><p>Your chosen bio appears here.</p></div>
            <div className="editorial-preview-links"><div><span>01</span><i>Published link</i><b>↗</b></div><div><span>02</span><i>Another destination</i><b>↗</b></div></div>
            <div className="editorial-preview-foot"><span>LINKHUB</span><span>READY WHEN YOU ARE</span></div>
          </div>
          <div className="hero-note hero-note-top"><span>01</span> A little room to be yourself</div><div className="hero-note hero-note-bottom">Edit in your studio <b>↗</b></div>
        </div>
        <a className="scroll-cue" href="#features"><span>WHAT YOU CAN DO</span><FaArrowDown /></a>
      </section>
      <section className="welcome-features" id="features"><div className="features-heading"><span className="eyebrow">ONE PAGE, A FEW GOOD THINGS</span><h2>Simple to make.<br /><em>Easy to keep yours.</em></h2></div><div className="feature-grid"><article><span>01 / INTRODUCE</span><h3>Start with the essentials.</h3><p>Add a profile photo and a short bio. Your public About section reflects the details you choose to publish.</p></article><article><span>02 / ARRANGE</span><h3>Put your links in order.</h3><p>Add, edit, remove, and reorder the HTTPS destinations you want people to find.</p></article><article><span>03 / MAKE IT YOURS</span><h3>Choose the presentation.</h3><p>Try a theme and layout in the studio preview. Your public page changes only when you publish.</p></article></div><div className="features-bottom"><span>MADE FOR THE THINGS YOU CHOOSE TO SHARE</span><Link to="/about">More about Linkhub <span aria-hidden="true">↗</span></Link></div></section>
    </main>
  );
}

export default Welcome;
