import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowDown, FaArrowUp, FaArrowUpRightFromSquare, FaCheck, FaCloudArrowUp, FaPlus, FaTrash, FaUser, FaLink, FaEye, FaCopy, FaRotateLeft } from "react-icons/fa6";
import request from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { clearProfileDraft, getAccountId, getProfileDraftKey, readProfileDraft, writeProfileDraft } from "../lib/profileDraft";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileComposition from "../components/ProfileComposition";
import { DEFAULT_PROFILE_THEME, getProfileTheme } from "../lib/profileTheme";
import { isValidUsername, isValidHttpsUrl, validateImage, hasDuplicateUrls, hasDuplicateTitles } from "../lib/validators";
import "../styles/Dashboard.css";
import "../styles/DashboardEditorial.css";

const MAX_LINKS = 10;
const EMPTY_LINK = { title: "", url: "" };
const DEFAULT_THEME = DEFAULT_PROFILE_THEME;
const THEME_PRESETS = {
  "after-hours": { backgroundColor: "#17151c", accentColor: "#c0a2ff" },
  paper: { backgroundColor: "#f3efe7", accentColor: "#8063bb" },
  moss: { backgroundColor: "#17211d", accentColor: "#c1dda3" },
};

const toProfileSnapshot = (profile) => ({
  username: profile.username || "",
  bio: profile.bio || "",
  avatarUrl: profile.avatarUrl || "",
  links: (profile.links || []).map(({ title, url }) => ({ title: title || "", url: url || "" })),
  theme: getProfileTheme(profile.theme),
});

function Dashboard() {
  const { login, token, user: authUser } = useAuth();
  const accountId = getAccountId(authUser, token);
  const draftKey = getProfileDraftKey(accountId);
  const initialDraftRef = useRef(null);
  if (!initialDraftRef.current && draftKey) initialDraftRef.current = readProfileDraft(draftKey, accountId);
  const initialProfile = { ...(initialDraftRef.current?.profile || {}), theme: getProfileTheme(initialDraftRef.current?.profile?.theme) };
  const [username, setUsername] = useState(initialProfile.username || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || "");
  const [links, setLinks] = useState(initialProfile.links || []);
  const [validatedLinks, setValidatedLinks] = useState(() => Object.fromEntries((initialProfile.links || []).map((_, index) => [index, true])));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(initialProfile.theme || DEFAULT_THEME);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsStatus, setAnalyticsStatus] = useState("loading");
  const [analyticsError, setAnalyticsError] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState(initialDraftRef.current?.baseUpdatedAt || null);
  const [isHydrated, setIsHydrated] = useState(Boolean(initialDraftRef.current));
  const [loadFailed, setLoadFailed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [draftConflict, setDraftConflict] = useState(false);
  const [draftStorageFailed, setDraftStorageFailed] = useState(false);
  const [previewMode, setPreviewMode] = useState("phone");
  const savingRef = useRef(false);
  const profileSnapshot = useMemo(() => toProfileSnapshot({ username, bio, avatarUrl, links, theme }), [username, bio, avatarUrl, links, theme]);
  const isDirty = !savedSnapshot || JSON.stringify(profileSnapshot) !== JSON.stringify(savedSnapshot);
  const publishedUsername = savedSnapshot?.username || username;
  const avatarPending = avatarUrl.startsWith("data:image");
  const themeHasChanges = Boolean(savedSnapshot) && JSON.stringify(theme) !== JSON.stringify(savedSnapshot.theme);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsStatus("loading");
    setAnalyticsError("");
    try {
      const data = await request("/api/user/me/analytics", { requiresAuth: true });
      if (!Number.isFinite(data?.views) || !Number.isFinite(data?.clicks) || !Array.isArray(data?.links)) {
        throw new Error("The activity response was incomplete.");
      }
      setAnalytics(data);
      setAnalyticsStatus("success");
    } catch (err) {
      setAnalytics(null);
      setAnalyticsStatus("error");
      if (err.status === 401) {
        setAnalyticsError("Your sign-in session may have expired. Sign in again to view profile activity.");
      } else if (err.status === 503) {
        setAnalyticsError("Profile activity is temporarily unavailable. Please wait a moment and try again.");
      } else if (err.status >= 500) {
        setAnalyticsError("A server problem prevented profile activity from loading. Please try again.");
      } else if (err.status === 0) {
        setAnalyticsError(err.message || "We couldn't reach profile activity. Check your connection and try again.");
      } else {
        setAnalyticsError("We couldn't load profile activity. Please try again.");
      }
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await request("/api/user/me", { requiresAuth: true });
      const serverSnapshot = toProfileSnapshot(data);
      setSavedSnapshot(serverSnapshot);
      setBaseUpdatedAt(initialDraftRef.current ? initialDraftRef.current.baseUpdatedAt : data.updatedAt || null);
      if (initialDraftRef.current) {
        const savedBaseline = initialDraftRef.current.baseUpdatedAt;
        setDraftConflict(savedBaseline !== (data.updatedAt || null));
      } else {
        setUsername(serverSnapshot.username);
        setBio(serverSnapshot.bio);
        setAvatarUrl(serverSnapshot.avatarUrl);
        setLinks(serverSnapshot.links);
        setTheme(serverSnapshot.theme);
        setValidatedLinks(Object.fromEntries(serverSnapshot.links.map((_, index) => [index, true])));
      }
      setIsHydrated(true);
      setLoadFailed(false);
      setError("");
      fetchAnalytics();
    } catch (err) {
      setError(err.message || "Unable to load your profile.");
      setLoadFailed(true);
      setIsHydrated(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!isHydrated || !accountId || !draftKey) return;
    if (!isDirty) {
      clearProfileDraft(draftKey, accountId);
      setDraftStorageFailed(false);
      return;
    }
    setDraftStorageFailed(!writeProfileDraft(draftKey, accountId, profileSnapshot, baseUpdatedAt));
  }, [accountId, baseUpdatedAt, draftKey, isDirty, isHydrated, profileSnapshot]);

  const handleLinkChange = (index, field, value) => {
    setLinks((current) => current.map((link, i) => i === index ? { ...link, [field]: value } : link));
    setValidatedLinks((current) => ({ ...current, [index]: false }));
  };

  const addLink = () => {
    if (links.length >= MAX_LINKS) return toast.info(`You can add up to ${MAX_LINKS} links.`);
    setLinks((current) => [...current, { ...EMPTY_LINK }]);
  };

  const removeLink = (index) => {
    setLinks((current) => current.filter((_, i) => i !== index));
    setValidatedLinks((current) => Object.fromEntries(Object.entries(current)
      .filter(([key]) => Number(key) !== index)
      .map(([key, value]) => [Number(key) > index ? Number(key) - 1 : Number(key), value])));
  };

  const moveLink = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    setLinks((current) => {
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
    setValidatedLinks((current) => ({ ...current, [index]: current[target], [target]: current[index] }));
  };

  const validateLink = (index) => {
    const link = links[index];
    if (!link.title.trim() || !isValidHttpsUrl(link.url)) {
      setValidatedLinks((current) => ({ ...current, [index]: false }));
      toast.error("Add a link title and a valid HTTPS URL first.");
      return;
    }
    setValidatedLinks((current) => ({ ...current, [index]: true }));
    toast.success("Link is ready to publish.");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    const result = validateImage(file);
    if (!result.valid) return toast.error(result.message);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(String(reader.result || ""));
    reader.onerror = () => toast.error("This image could not be opened. Choose another file.");
    reader.readAsDataURL(file);
  };

  const resetTheme = () => setTheme(getProfileTheme(savedSnapshot?.theme || DEFAULT_THEME));

  const activeLinks = useMemo(() => links.filter((link) => link.title.trim() && link.url.trim()), [links]);

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${publishedUsername}`);
      toast.success(isDirty ? "Current live profile URL copied. Publish your edits to update it." : "Public profile link copied.");
    } catch {
      toast.error("Could not copy the profile link. Check browser clipboard permissions.");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    setError("");
    if (!isValidUsername(username)) return toast.error("Username must be 3–20 lowercase letters, numbers, or underscores.");
    if (bio.length > 160) return toast.error("Bio must be 160 characters or fewer.");
    const incomplete = links.some((link) => Boolean(link.title.trim()) !== Boolean(link.url.trim()));
    if (incomplete) return toast.error("Complete or remove each link row before saving.");
    if (activeLinks.some((link) => !isValidHttpsUrl(link.url))) return toast.error("Every link must use a valid HTTPS URL.");
    if (activeLinks.some((link) => !link.title.trim())) return toast.error("Every link needs a title.");
    if (hasDuplicateTitles(activeLinks) || hasDuplicateUrls(activeLinks)) return toast.error("Link titles and URLs must be unique.");
    if (activeLinks.some((link) => !validatedLinks[links.indexOf(link)])) return toast.error("Validate each edited link before saving.");

    try {
      savingRef.current = true;
      setIsSaving(true);
      setSaveFailed(false);
      const response = await request("/api/user/me", {
        method: "PUT",
        requiresAuth: true,
        body: { username: username.trim(), bio: bio.trim(), avatarUrl, links: activeLinks.map(({ title, url }) => ({ title: title.trim(), url: url.trim() })), theme },
      });
      const saved = response.user;
      setUsername(saved.username);
      setBio(saved.bio || "");
      setAvatarUrl(saved.avatarUrl || "");
      setLinks(saved.links || []);
      setTheme(saved.theme || theme);
      setValidatedLinks(Object.fromEntries((saved.links || []).map((_, index) => [index, true])));
      const confirmedSnapshot = toProfileSnapshot(saved);
      setSavedSnapshot(confirmedSnapshot);
      setBaseUpdatedAt(saved.updatedAt || null);
      setDraftConflict(false);
      clearProfileDraft(draftKey, accountId);
      if (token) login(token, saved);
      toast.success("Your profile is live.");
    } catch (err) {
      setSaveFailed(true);
      setError(err.message || "Unable to save your profile.");
      toast.error(err.message || "Unable to save your profile.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  if (isLoading && !initialDraftRef.current) return <main className="dashboard-shell"><LoadingSpinner label="Loading your studio…" /></main>;

  return (
    <main className="dashboard-shell">
      <header className="studio-heading">
        <div><span className="eyebrow">YOUR CREATOR STUDIO</span><h1>Make your corner<br className="desktop-break" /> of the internet.</h1><p>Shape your profile and give every important link a home.</p><span className={`publish-status ${isSaving ? "status-saving" : saveFailed ? "status-failed" : isDirty ? "status-unsaved" : "status-published"}`} role="status">{isSaving ? (avatarPending ? "Uploading photo and saving…" : "Saving changes…") : saveFailed ? "Couldn't save · your draft is safe" : isDirty ? "Unsaved changes · saved on this device" : "Published"}</span></div>
        <div className="studio-actions"><Link className="public-link" to={`/${publishedUsername}`} target="_blank"><FaEye /> View live page <FaArrowUpRightFromSquare /></Link><button type="button" className="copy-profile-link" onClick={copyProfileUrl}><FaCopy /> Copy profile URL</button></div>
      </header>
      {error && <div className="dashboard-alert" role="alert">{error}{loadFailed && <button type="button" className="retry-load" onClick={fetchUser}>Retry loading profile</button>}</div>}
      {draftConflict && <div className="draft-conflict" role="status">The saved profile changed since this draft was created. Your local edits are preserved; review them before publishing.</div>}
      {draftStorageFailed && <div className="dashboard-alert" role="alert">This browser could not save the local draft. Your current edits are still in the editor; try a smaller avatar image.</div>}

      <div className="studio-grid">
        <form className="editor-panel" onSubmit={handleSave}>
          <fieldset className="editor-fields" disabled={isSaving}>
          <section className="editor-section">
            <div className="section-heading"><span className="section-icon"><FaUser /></span><div><h2>Your profile</h2><p>The first things people see when they visit.</p></div></div>
            <div className="avatar-control">
              <div className="avatar-thumb">{avatarUrl ? <img src={avatarUrl} alt="Profile preview" /> : <FaUser />}</div>
              <label className="upload-button"><FaCloudArrowUp /> Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} /></label>
              <span>{avatarPending ? "Photo ready · uploads when you publish" : "JPG, PNG or WebP · up to 5 MB"}</span>
            </div>
            <label className="field-label" htmlFor="username">Username</label>
            <div className="username-field"><span>{window.location.host}/</span><input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} maxLength={20} autoComplete="off" required /></div>
            <label className="field-label" htmlFor="bio">Bio <span>{bio.length}/160</span></label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} maxLength={160} rows={3} placeholder="A little about what you make, do, or love…" />
          </section>

          <section className="editor-section links-section">
            <div className="section-heading"><span className="section-icon"><FaLink /></span><div><h2>Your links <span className="count-pill">{activeLinks.length}</span></h2><p>Arrange the destinations you want to share.</p></div></div>
            {links.length === 0 && <div className="links-empty"><span className="empty-link-icon"><FaLink /></span><strong>Your list starts here</strong><span>Add your first link and it’ll appear in your live preview.</span></div>}
            <div className="link-editor-list">{links.map((link, index) => (
              <div className="link-editor-card" key={index}>
                <div className="link-row-heading"><span>LINK {String(index + 1).padStart(2, "0")}</span><div className="link-row-actions"><button type="button" className="move-link" onClick={() => moveLink(index, -1)} disabled={index === 0} aria-label={`Move ${link.title || `link ${index + 1}`} up`}><FaArrowUp /></button><button type="button" className="move-link" onClick={() => moveLink(index, 1)} disabled={index === links.length - 1} aria-label={`Move ${link.title || `link ${index + 1}`} down`}><FaArrowDown /></button><button type="button" className="remove-link" onClick={() => removeLink(index)} aria-label={`Remove ${link.title || `link ${index + 1}`}`}><FaTrash /></button></div></div>
                <input value={link.title} onChange={(e) => handleLinkChange(index, "title", e.target.value)} maxLength={40} placeholder="Link title · e.g. My portfolio" aria-label={`Link ${index + 1} title`} />
                <div className="link-url-row"><input type="url" value={link.url} onChange={(e) => handleLinkChange(index, "url", e.target.value)} placeholder="https://yourwebsite.com" aria-label={`Link ${index + 1} URL`} /><button type="button" className={`validate-link ${validatedLinks[index] ? "is-valid" : ""}`} onClick={() => validateLink(index)} aria-label="Validate link">{validatedLinks[index] ? <FaCheck /> : "Check"}</button></div>
              </div>
            ))}</div>
            {links.length < MAX_LINKS && <button type="button" className="add-link-button" onClick={addLink}><FaPlus /> Add a link</button>}
          </section>
          <section className="editor-section appearance-section">
            <div className="section-heading"><span className="section-icon"><FaEye /></span><div><h2>Profile appearance</h2><p>Preview every choice before you publish it.</p></div></div>
            <div className="theme-controls">
              <label>Theme <select value={theme.themeName} onChange={(event) => setTheme((value) => ({ ...value, themeName: event.target.value, ...THEME_PRESETS[event.target.value] }))}><option value="after-hours">After Hours</option><option value="paper">Paper</option><option value="moss">Moss</option></select></label>
              <label>Layout <select value={theme.layout} onChange={(event) => setTheme((value) => ({ ...value, layout: event.target.value }))}><option value="editorial">Asymmetric</option><option value="stacked">Stacked</option></select></label>
              <label>Link cards <select value={theme.linkStyle} onChange={(event) => setTheme((value) => ({ ...value, linkStyle: event.target.value }))}><option value="soft">Soft surface</option><option value="solid">Accent fill</option><option value="outline">Outline</option></select></label>
              <label>Corners <select value={theme.cornerStyle} onChange={(event) => setTheme((value) => ({ ...value, cornerStyle: event.target.value }))}><option value="square">Square</option><option value="soft">Soft</option></select></label>
              <label>Background <input type="color" value={theme.backgroundColor} onChange={(event) => setTheme((value) => ({ ...value, backgroundColor: event.target.value }))} /></label>
              <label>Accent <input type="color" value={theme.accentColor} onChange={(event) => setTheme((value) => ({ ...value, accentColor: event.target.value }))} /></label>
              <button type="button" className="reset-theme-button" onClick={resetTheme} disabled={!themeHasChanges}><FaRotateLeft /> Revert appearance</button>
            </div>
            <p className="theme-save-note" role="status">Appearance changes are previewed here and saved only when you choose Publish changes.</p>
          </section>
          <section className="editor-section analytics-section">
            <div className="section-heading"><span className="section-icon"><FaEye /></span><div><h2>Profile activity</h2><p>Unique views and link clicks, counted in 30 minute windows.</p></div></div>
            {analyticsStatus === "loading" ? <p role="status" aria-live="polite">Loading profile activity…</p> : null}
            {analyticsStatus === "error" ? <div className="analytics-error" role="alert"><p>{analyticsError}</p><button type="button" className="analytics-retry" onClick={fetchAnalytics}>Retry activity</button></div> : null}
            {analyticsStatus === "success" && analytics?.views === 0 && analytics?.clicks === 0 ? <p className="analytics-empty" role="status">No activity yet. Your views and link clicks will appear here once visitors start interacting with your profile.</p> : null}
            {analyticsStatus === "success" && analytics && (analytics.views > 0 || analytics.clicks > 0) ? <><div className="analytics-summary"><div><strong>{analytics.views}</strong><span>Views</span></div><div><strong>{analytics.clicks}</strong><span>Link clicks</span></div><div><strong>{analytics.mostClickedLink?.title || "—"}</strong><span>Most clicked</span></div></div>{analytics.links.length > 0 && <ul className="analytics-links">{analytics.links.map((link) => <li key={link.url}><span>{link.title}</span><strong>{link.clicks}</strong></li>)}</ul>}</> : null}
          </section>
          </fieldset>
          <footer className="editor-footer"><span>{isDirty ? "Your current edits are saved as a local draft." : "Your public profile is up to date."}</span><button className="publish-button" type="submit" disabled={isSaving || !isDirty}>{isSaving ? <LoadingSpinner label={avatarPending ? "Uploading & publishing…" : "Publishing…"} /> : saveFailed ? "Retry publish" : "Publish changes"}</button></footer>
        </form>

        <aside className={`preview-column ${previewMode === "wide" ? "is-wide-preview" : ""}`}><div className="preview-label"><span>LIVE PREVIEW</span><span className="live-dot">● DRAFT</span></div><div className="preview-size-controls" role="group" aria-label="Preview size"><button type="button" aria-pressed={previewMode === "phone"} onClick={() => setPreviewMode("phone")}>Phone</button><button type="button" aria-pressed={previewMode === "wide"} onClick={() => setPreviewMode("wide")}>Wide</button></div><div className={`profile-preview-frame is-${previewMode}`}><ProfileComposition preview user={{ username: username || "", bio, avatarUrl, links: activeLinks, theme }} /></div><div className="preview-note">Draft content and appearance update as you edit. Only Publish changes updates your public page.</div></aside>
      </div>
    </main>
  );
}

export default Dashboard;
