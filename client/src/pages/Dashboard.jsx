import React, { useState, useEffect, useMemo } from "react";
import "../styles/Dashboard.css";
import { toast } from "react-toastify";
import { FaPlus, FaSave, FaLink, FaUserEdit, FaTrash } from "react-icons/fa";
import request from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

function Dashboard() {
  const defaultLinks = [
    { title: "Portfolio", url: "", validated: false },
    { title: "Resume", url: "", validated: false },
    { title: "GitHub", url: "", validated: false },
    { title: "Twitter", url: "", validated: false },
  ];

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [links, setLinks] = useState(defaultLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await request("/api/user/me");
        const hasProfile = data.username || data.bio || (data.links && data.links.length > 0);

        if (!hasProfile) {
          setIsNewUser(true);
          setIsEditing(true);
          toast.info("Welcome! Please fill your profile details.");
        }

        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
        if (data.links && data.links.length > 0) {
          const updatedLinks = data.links.map((link) => ({
            ...link,
            validated: link.validated || false,
          }));
          setLinks(updatedLinks);
        } else {
          setLinks(defaultLinks);
        }
      } catch (err) {
        setError(err.message || "Unable to load your profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    updatedLinks[index].validated = false;
    setLinks(updatedLinks);
  };

  const validateLink = (index) => {
    const newLinks = [...links];
    const link = newLinks[index];

    if (!link.url.startsWith("https://")) {
      toast.warn(`Link ${index + 1} must start with https://`);
      link.validated = false;
    } else {
      try {
        new URL(link.url);
        toast.success(`Link ${index + 1} validated successfully`);
        link.validated = true;
      } catch {
        toast.error(`Link ${index + 1} is not a valid URL`);
        link.validated = false;
      }
    }
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, { title: "", url: "", validated: false }]);
  };

  const deleteLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatarUrl(reader.result);  
    setUploadPreview(reader.result);
  };
  reader.readAsDataURL(file);
};


  const allValidated = useMemo(() => links.length > 0 && links.every((l) => l.validated), [links]);

  const handleSave = async () => {
    if (!allValidated) {
      toast.warn("Please validate all links before submitting.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = { username, bio, avatarUrl: avatarUrl || uploadPreview, links };
      await request("/api/user/me", { method: "PUT", body: payload });
      toast.success("Profile saved successfully!");
      setIsEditing(false);
      setIsNewUser(false);
    } catch (err) {
      setError(err.message || "Failed to save profile");
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner label="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>
          {isNewUser
            ? "Complete Your Profile Setup"
            : "Welcome to your Personal Space"}
        </h2>
        {!isEditing && !isNewUser && (
          <button className="icon-btn" onClick={() => setIsEditing(true)}>
            <FaUserEdit /> Edit
          </button>
        )}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {!isEditing ? (
        <div className="profile-preview">
          {avatarUrl && <img src={avatarUrl} alt="avatar" className="avatar-preview" />}
          <h3>
            <a
              href={`https://linkinbio-mern.vercel.app/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-preview-link"
            >
              @{username}
            </a>
          </h3>
          <p>{bio}</p>

          <div className="links-preview">
            <h4><FaLink /> Your Links</h4>
            <ul>
              {links.map((link, i) =>
                link.url ? (
                  <li key={i} className="profile-preview-link-item">
                    <strong>{link.title || "Link"}:</strong>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-preview-link-anchor"
                    >
                      {link.url}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <p className="info-text">
            Every link should be validated before saving. Please validate using the Validate button.
          </p>

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Profile Picture:</label>
            {uploadPreview || avatarUrl ? (
              <img src={uploadPreview || avatarUrl} alt="avatar" className="avatar-preview" />
            ) : (
              <p>No image</p>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <input
              type="text"
              value={avatarUrl}
              placeholder="Or paste image URL"
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setUploadPreview("");
              }}
            />
          </div>

          <div className="form-group">
            <label>Bio:</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Your Links:</label>
            {links.map((link, i) => (
              <div key={i} className="link-row">
                {i >= 4 && (
                  <input
                    type="text"
                    placeholder="Title"
                    value={link.title}
                    onChange={(e) => handleChange(i, "title", e.target.value)}
                  />
                )}
                <input
                  type="url"
                  placeholder="https:// - Enter Your Link"
                  value={link.url}
                  onChange={(e) => handleChange(i, "url", e.target.value)}
                />
                <button onClick={() => validateLink(i)} className="validate-btn">
                  Validate
                </button>
                {i >= 4 && (
                  <button className="delete-btn" onClick={() => deleteLink(i)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}

            <button className="add-btn" onClick={addLink}>
              <FaPlus /> Add
            </button>
          </div>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!allValidated || isSaving}
          >
            {isSaving ? <LoadingSpinner label="Saving..." /> : <><FaSave /> {isNewUser ? "Save Profile" : "Submit"}</>}
          </button>
        </>
      )}
    </div>
  );
}

export default Dashboard;