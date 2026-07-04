import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/PublicProfile.css";
import request from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await request(`/api/user/${username}`, { auth: false });
        setUser(data);
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [username]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <LoadingSpinner label="Loading profile..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {user.avatarUrl && (
          <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
        )}
        <h2 className="profile-username">@{user.username}</h2>
        <p className="profile-bio">{user.bio}</p>

        <div className="link-list">
          {user.links?.map((link, idx) => (
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