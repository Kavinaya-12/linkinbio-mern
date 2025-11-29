import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/PublicProfile.css";

function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // const res = await fetch(`http://localhost:5000/api/user/profile/${username}`);
                const res = await fetch(`http://localhost:5000/api/user/${username}`);

        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    fetchUser();
  }, [username]);

  if (!user) return
   <p style={{ color: "#f1f5f9", textAlign: "center" }}>Loading profile...
   </p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {user.avatarUrl && (
          <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
        )}
        <h2 className="profile-username">@{user.username}</h2>
        <p className="profile-bio">{user.bio}</p>

        <div className="link-list">
          {user.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-link"
            >
              {link.title || link.url}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;