import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AboutUs.css";
import "../styles/EditorialPages.css";

function AboutUs() {
  const { token } = useAuth();
  return (
    <main className="editorial-page about-page">
      <div className="editorial-page-index"><span>LINKHUB / ABOUT</span><span>01—03</span></div>
      <section className="editorial-page-hero">
        <p className="editorial-eyebrow"><span /> A SMALLER, CLEARER CORNER OF THE WEB</p>
        <h1>A page for<br /><em>everything you make.</em></h1>
        <p className="editorial-deck">Linkhub brings a creator’s public links, short bio, and profile into one address that is easy to share and easy to keep current.</p>
        <Link className="editorial-action" to={token ? "/dashboard" : "/signup"}>{token ? "Open your studio" : "Make your page"}<span aria-hidden="true">↗</span></Link>
      </section>
      <section className="about-detail-grid" aria-label="How Linkhub works">
        <article><span className="editorial-eyebrow">01 / YOUR INTRO</span><h2>Say enough.</h2><p>A profile can show your username, avatar, and the bio you choose to publish. Its About section uses that saved bio, with a clear empty state when you have not written one.</p></article>
        <article><span className="editorial-eyebrow">02 / YOUR DESTINATIONS</span><h2>Keep the map close.</h2><p>Add and arrange up to ten published HTTPS links in your studio. The public page uses those saved titles and destinations as they are.</p></article>
        <article><span className="editorial-eyebrow">03 / YOUR EDITION</span><h2>Make it yours.</h2><p>Choose a saved color palette, link treatment, and layout. Review the live preview, then publish changes when you are ready.</p></article>
      </section>
      <footer className="editorial-page-footer"><span>ABOUT THE PLATFORM</span><span>Built around what you choose to share.</span></footer>
    </main>
  );
}

export default AboutUs;
