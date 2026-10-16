import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileComposition from "../components/ProfileComposition";
import LoadingSpinner from "../components/LoadingSpinner";
import request, { API_URL } from "../lib/api";
import "../styles/PublicProfile.css";

const sendAnalyticsEvent = (path) => {
  const url = `${API_URL}${path}`;
  const body = new Blob([], { type: "text/plain" });
  if (navigator.sendBeacon?.(url, body)) return;
  fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
};

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await request(`/api/user/${encodeURIComponent(username)}`, { auth: false });
        if (!isMounted) return;
        setUser(data);
        document.title = `${data.username} | Linkhub`;
        if (data.username !== username) navigate(`/${data.username}`, { replace: true });
        sendAnalyticsEvent(`/api/user/${encodeURIComponent(data.username)}/track/view`);
        const section = window.location.hash.slice(1);
        if (["about", "links"].includes(section)) {
          window.requestAnimationFrame(() => {
            if (isMounted) document.getElementById(section)?.scrollIntoView();
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setUser(null);
        setError(err.message || "Unable to load profile.");
        document.title = "Profile Not Found | Linkhub";
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [username, navigate]);

  const trackLink = useCallback((index) => {
    sendAnalyticsEvent(`/api/user/${encodeURIComponent(user.username)}/track/click/${index}`);
  }, [user]);

  if (isLoading) return <div className="profile-state"><LoadingSpinner label="Loading profile…" /></div>;

  if (error || !user) {
    return <main className="profile-state"><span className="profile-state-index">LINKHUB / 404</span><p className="profile-kicker">THIS PAGE IS OFF THE MAP</p><h1>Profile not found.</h1><p>{error || "This username does not have a public profile."}</p><a href="/">Back to Linkhub <span aria-hidden="true">↗</span></a></main>;
  }

  return <ProfileComposition user={user} onLinkClick={trackLink} />;
}

export default PublicProfile;
