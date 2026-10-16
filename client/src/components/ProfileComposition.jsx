import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { getProfileTheme, readableTextForColor } from "../lib/profileTheme";

function ProfileComposition({ user, preview = false, onLinkClick }) {
  const theme = getProfileTheme(user.theme);
  const Root = preview ? "div" : "main";

  return (
    <Root
      className={`profile-page theme-${theme.themeName} layout-${theme.layout} link-${theme.linkStyle} corners-${theme.cornerStyle}${preview ? " profile-page-preview" : ""}`}
      style={{ "--profile-bg": theme.backgroundColor, "--profile-accent": theme.accentColor, "--profile-accent-ink": readableTextForColor(theme.accentColor) }}
    >
      <div className="profile-content">
        <section className="profile-intro" id="about" aria-labelledby="profile-title">
          <div className="profile-identity">
            {user.avatarUrl ? (
              <img className="profile-avatar" src={user.avatarUrl} alt={`@${user.username}`} />
            ) : (
              <div className="profile-avatar profile-avatar-initial" aria-hidden="true">{user.username?.slice(0, 1)?.toUpperCase() || "L"}</div>
            )}
            <h1 id="profile-title">@{user.username}</h1>
          </div>
          <div className="profile-about-copy">
            <p className="profile-bio">{user.bio || "This profile hasn’t added a biography yet."}</p>
          </div>
        </section>

        <section className="profile-links-section" id="links" aria-labelledby="links-title">
          <div className="profile-section-heading">
            <h2 id="links-title">Links</h2>
            {user.links?.length > 0 && <p>{user.links.length} published {user.links.length === 1 ? "link" : "links"}</p>}
          </div>
          {user.links?.length ? (
            <div className="profile-link-grid">
              {user.links.map((link, index) => {
                const linkClassName = "profile-link-card";
                if (preview) {
                  return <div className={linkClassName} key={`${link.title}-${index}`}><span className="profile-link-title">{link.title}</span><FaArrowUpRightFromSquare aria-hidden="true" /></div>;
                }
                return (
                  <a className={linkClassName} key={`${link.title}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => onLinkClick?.(index)}>
                    <span className="profile-link-title">{link.title}</span><FaArrowUpRightFromSquare aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          ) : <p className="profile-empty-state">No links have been published here yet.</p>}
        </section>
      </div>
    </Root>
  );
}

export default ProfileComposition;
