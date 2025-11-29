// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import "../styles/Dashboard.css";
// import { toast } from "react-toastify";
// import { FaSignOutAlt, FaPlus, FaSave, FaLink, FaUserEdit, FaTrash } from "react-icons/fa";

// function Dashboard() {
//   const defaultLinks = [
//     { title: "Portfolio", url: "" },
//     { title: "Resume", url: "" },
//     { title: "GitHub", url: "" },
//     { title: "Twitter", url: "" },
//   ];

//   const [username, setUsername] = useState("");
//   const [bio, setBio] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("");
//   const [uploadPreview, setUploadPreview] = useState("");
//   const [links, setLinks] = useState( [{ title: "", url: "", validated: false }]);
//   const [isEditing, setIsEditing] = useState(false);
//   // const { logout } = useAuth();

//   useEffect(() => {
//     async function fetchUser() {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:5000/api/user/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setUsername(data.username || "");
//         setBio(data.bio || "");
//         setAvatarUrl(data.avatarUrl || "");
//         setLinks(data.links && data.links.length > 0 ? data.links : defaultLinks);
//         setIsEditing(!data.username); 
//       }
//     }
//     fetchUser();
//   }, []);

//   const handleChange = (index, field, value) => {
//     const updatedLinks = [...links];
//     updatedLinks[index][field] = value;
//     setLinks(updatedLinks);
//   };
// // const handleChange = (index, field, value) => {
// //   const updatedLinks = [...links];
// //   updatedLinks[index][field] = value;

// //   // Optional: Show warning for invalid URL
// //   if (field === "url" && value && !value.startsWith("https://")) {
// //     toast.warn("URLs must start with https://");
// //   }

// //   setLinks(updatedLinks);
// // };


//   const validateLink = (index) => {
//     const link = links[index];
//     if (!link.url.startsWith("https://")) {
//       toast.warn(`Link ${index + 1} must start with https://`);
//     } else {
//       toast.success(`Link ${index + 1} is valid`);
//     }
//   };

//   const addLink = () => {
//     setLinks([...links, { title: "", url: "" }]);
//   };

//   const deleteLink = (index) => {
//     const updatedLinks = links.filter((_, i) => i !== index);
//     setLinks(updatedLinks);
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const previewURL = URL.createObjectURL(file);
//       setUploadPreview(previewURL);
//       setAvatarUrl("");
//     }
//   };

//   const handleSave = async () => {
//     const token = localStorage.getItem("token");
//     const payload = { username, bio, avatarUrl: avatarUrl || uploadPreview, links };

//     const res = await fetch("http://localhost:5000/api/user/me", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       toast.success("Profile saved successfully!");
//       setIsEditing(false);
//     } else {
//       toast.error(data.message || "Failed to save profile");
//     }
//   };

// // const handleSave = async () => {
// //   const token = localStorage.getItem("token");
// //   if (!token) {
// //     toast.error("User not authenticated");
// //     return;
// //   }

// //   // Sanitize links: Ensure https:// and remove empty ones
// //   const sanitizedLinks = links
// //     .filter(link => link.url.trim() !== "")
// //     .map(link => ({
// //       title: link.title.trim(),
// //       url: link.url.trim().startsWith("https://")
// //         ? link.url.trim()
// //         : `https://${link.url.trim()}`,
// //     }));

// //   const payload = {
// //     username: username.trim(),
// //     bio: bio.trim(),
// //     avatarUrl: avatarUrl || uploadPreview,
// //     links: sanitizedLinks,
// //   };

// //   try {
// //     const res = await fetch("http://localhost:5000/api/user/me", {
// //       method: "PUT",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${token}`,
// //       },
// //       body: JSON.stringify(payload),
// //     });

// //     const data = await res.json();

// //     if (res.ok) {
// //       toast.success("Profile saved successfully!");
// //       setIsEditing(false);
// //     } else {
// //       toast.error(data.message || "Failed to save profile");
// //     }
// //   } catch (error) {
// //     console.error("Save error:", error);
// //     toast.error("Something went wrong. Please try again.");
// //   }
// // };
// // {/* <p style={{ fontSize: "0.85em", color: "gray" }}>
// //   Your public URL will be: <strong>linkhub.com/{username || "username"}</strong>
// // </p> */}

// //     <div className="dashboard-container">
// //       <div className="dashboard-header">
// //         <h2>Welcome to your Personal Space</h2>
// //         <div>
// //           {!isEditing && (
// //             <button className="icon-btn" onClick={() => setIsEditing(true)}>
// //               <FaUserEdit /> Edit
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {!isEditing ? (
// //         <div className="profile-preview">
// //           {avatarUrl && <img src={avatarUrl} alt="avatar" className="avatar-preview" />}
// //           <h3>
// //   <a
// //     href={`http://localhost:5173/u/${username}`}
// //     target="_blank"
// //     rel="noopener noreferrer"
// //     style={{ color: "var(--color-secondary-vibrant-blue)", textDecoration: "none" }}
// //   >
// //     @{username}
// //   </a>
// // </h3>

// //           <p>{bio}</p>
// //   <div className="links-preview">
// //   <h4><FaLink /> Your Links</h4>
// //   <ul>
// //     {links.map((link, i) => (
// //       link.url && (
// //         <li key={i} style={{ display: "flex", gap: "10px", fontSize: "1.05em" }}>
// //           <strong>{link.title || "Link"}:</strong>
// //           <a
// //             href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             style={{ color: "var(--color-secondary-vibrant-blue)" }}
// //           >
// //             {link.url}
// //           </a>
// //         </li>
// //       )
// //     ))}
// //   </ul>
// // </div>
// //         </div>
// //       ) : (
// //         <>
// //           <div className="form-group">
// //             <label>Username:</label>
// //             <input
// //               type="text"
// //               value={username}
// //               placeholder="username"
// //               onChange={(e) => setUsername(e.target.value)}
// //             />
// //           </div>

// //           <div className="form-group">
// //             <label>Profile Picture:</label>
// //             {uploadPreview || avatarUrl ? (
// //               <img
// //                 src={uploadPreview || avatarUrl}
// //                 alt="avatar"
// //                 className="avatar-preview"
// //               />
// //             ) : (
// //               <p>No image</p>
// //             )}
// //             <input type="file" accept="image/*" onChange={handleImageUpload} />
// //             <input
// //               type="text"
// //               value={avatarUrl}
// //               // placeholder="https://example.com/image.jpg"
// //               onChange={(e) => {
// //                 setAvatarUrl(e.target.value);
// //                 setUploadPreview("");
// //               }}
// //             />
// //           </div>

// //           <div className="form-group">
// //             <label>Bio:</label>
// //             <textarea
// //               rows="3"
// //               value={bio}
// //               onChange={(e) => setBio(e.target.value)}
// //             />
// //           </div>

// //           <div className="form-group">
// //             <label>Your Links:</label>
// //           {links.map((link, i) => (
// //   <div key={i} className="link-row">
// //     {i >= 4 && (
// //       <input
// //         type="text"
// //         placeholder="Title"
// //         value={link.title}
// //         onChange={(e) => handleChange(i, "title", e.target.value)}
// //       />
// //     )}
// //     <input
// //       type="url"
// //       placeholder="https://   - Enter Your Link"
// //       value={link.url}
// //       onChange={(e) => handleChange(i, "url", e.target.value)}
// //     />
// //     {i >= 4 && (
// //       <button className="delete-btn" onClick={() => deleteLink(i)}>
// //         <FaTrash />
// //       </button>
// //     )}
// //   </div>
// // ))}

// //             <button className="add-btn" onClick={addLink}>
// //               <FaPlus /> Add 
// //             </button>
// //           </div>

// //           <button className="save-btn" onClick={handleSave}>
// //             <FaSave /> Submit
// //           </button>
// //         </>
// //       )}
// //     </div>

//   return (

// <div className="dashboard-container">
//       <div className="dashboard-header">
//         <h2>Welcome to your Personal Space</h2>
//         {!isEditing && (
//           <button className="icon-btn" onClick={() => setIsEditing(true)}>
//             <FaUserEdit /> Edit
//           </button>
//         )}
//       </div>

//       {!isEditing ? (
//         <div className="profile-preview">
//           {avatarUrl && <img src={avatarUrl} alt="avatar" className="avatar-preview" />}
//           <h3>
//             <a
//               href={`http://localhost:5173/u/${username}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{ color: "var(--color-secondary-vibrant-blue)", textDecoration: "none" }}
//             >
//               @{username}
//             </a>
//           </h3>
//           <p>{bio}</p>

//           <div className="links-preview">
//             <h4><FaLink /> Your Links</h4>
//             <ul>
//               {links.map((link, i) => (
//                 link.url && (
//                   <li key={i} style={{ display: "flex", gap: "10px", fontSize: "1.05em" }}>
//                     <strong>{link.title || "Link"}:</strong>
//                     <a
//                       href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={{ color: "var(--color-secondary-vibrant-blue)" }}
//                     >
//                       {link.url}
//                     </a>
//                   </li>
//                 )
//               ))}
//             </ul>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="form-group">
//             <label>Username:</label>
//             <input
//               type="text"
//               value={username}
//               placeholder="username"
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </div>

//           <div className="form-group">
//             <label>Profile Picture:</label>
//             {uploadPreview || avatarUrl ? (
//               <img
//                 src={uploadPreview || avatarUrl}
//                 alt="avatar"
//                 className="avatar-preview"
//               />
//             ) : (
//               <p>No image</p>
//             )}
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             <input
//               type="text"
//               value={avatarUrl}
//               onChange={(e) => {
//                 setAvatarUrl(e.target.value);
//                 setUploadPreview("");
//               }}
//             />
//           </div>

//           <div className="form-group">
//             <label>Bio:</label>
//             <textarea
//               rows="3"
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//             />
//           </div>

//           <div className="form-group">
//             <label>Your Links:</label>
//             {links.map((link, i) => (
//               <div key={i} className="link-row">
//                 {i >= 4 && (
//                   <input
//                     type="text"
//                     placeholder="Title"
//                     value={link.title}
//                     onChange={(e) => handleChange(i, "title", e.target.value)}
//                   />
//                 )}
//                 <input
//                   type="url"
//                   placeholder="https:// - Enter Your Link"
//                   value={link.url}
//                   onChange={(e) => handleChange(i, "url", e.target.value)}
//                 />
//                 <button onClick={() => validateLink(i)} className="validate-btn">
//                   Validate
//                 </button>
//                 {i >= 4 && (
//                   <button className="delete-btn" onClick={() => deleteLink(i)}>
//                     <FaTrash />
//                   </button>
//                 )}
//               </div>
//             ))}

//             <button className="add-btn" onClick={addLink}>
//               <FaPlus /> Add
//             </button>
//           </div>

//           <button className="save-btn" onClick={handleSave}>
//             <FaSave /> Submit
//           </button>
//         </>
//       )}
//     </div>




//   );
// }

// export default Dashboard;


// // import React, { useState, useEffect } from "react";
// // import { toast } from "react-toastify";
// // import {
// //   FaPlus,
// //   FaSave,
// //   FaLink,
// //   FaUserEdit,
// //   FaTrash,
// // } from "react-icons/fa";
// // import "../styles/Dashboard.css";

// // function Dashboard() {
// //   const defaultLinks = [
// //     { title: "Portfolio", url: "" },
// //     { title: "Resume", url: "" },
// //     { title: "GitHub", url: "" },
// //     { title: "Twitter", url: "" },
// //   ];

// //   const [username, setUsername] = useState("");
// //   const [bio, setBio] = useState("");
// //   const [avatarUrl, setAvatarUrl] = useState("");
// //   const [uploadPreview, setUploadPreview] = useState("");
// //   const [links, setLinks] = useState(defaultLinks);
// //   const [isEditing, setIsEditing] = useState(false);

// //   // Fetch user data on mount
// //   useEffect(() => {
// //     async function fetchUser() {
// //       const token = localStorage.getItem("token");
// //       const res = await fetch("http://localhost:5000/api/user/me", {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       const data = await res.json();
// //       if (res.ok) {
// //         setUsername(data.username || "");
// //         setBio(data.bio || "");
// //         setAvatarUrl(data.avatarUrl || "");
// //         setLinks(data.links && data.links.length > 0 ? data.links : defaultLinks);
// //         setIsEditing(!data.username); // Enable edit if profile is empty
// //       }
// //     }
// //     fetchUser();
// //   }, []);

// //   // Handle link field change
// //   const handleChange = (index, field, value) => {
// //     const updatedLinks = [...links];
// //     updatedLinks[index][field] = value;

// //     if (field === "url" && value && !value.startsWith("https://")) {
// //       toast.warn("URLs must start with https://");
// //     }

// //     setLinks(updatedLinks);
// //   };

// //   const addLink = () => setLinks([...links, { title: "", url: "" }]);

// //   const deleteLink = (index) => {
// //     const updatedLinks = links.filter((_, i) => i !== index);
// //     setLinks(updatedLinks);
// //   };

// //   const handleImageUpload = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const previewURL = URL.createObjectURL(file);
// //       setUploadPreview(previewURL);
// //       setAvatarUrl("");
// //     }
// //   };

// //   // Save profile
// //   const handleSave = async () => {
// //     const token = localStorage.getItem("token");
// //     if (!token) {
// //       toast.error("User not authenticated");
// //       return;
// //     }

// //     const sanitizedLinks = links
// //       .filter((link) => link.url.trim() !== "")
// //       .map((link) => ({
// //         title: link.title.trim(),
// //         url: link.url.trim().startsWith("https://")
// //           ? link.url.trim()
// //           : `https://${link.url.trim()}`,
// //       }));

// //     const payload = {
// //       username: username.trim(),
// //       bio: bio.trim(),
// //       avatarUrl: avatarUrl || uploadPreview,
// //       links: sanitizedLinks,
// //     };

// //     try {
// //       const res = await fetch("http://localhost:5000/api/user/me", {
// //         method: "PUT",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       const data = await res.json();

// //       if (res.ok) {
// //         toast.success("Profile saved successfully!");
// //         setIsEditing(false);
// //       } else {
// //         toast.error(data.message || "Failed to save profile");
// //       }
// //     } catch (error) {
// //       console.error("Save error:", error);
// //       toast.error("Something went wrong. Please try again.");
// //     }
// //   };

// //   return (
// //     <div className="dashboard-container">
// //       <div className="dashboard-header">
// //         <h2>Welcome to your Personal Space</h2>
// //         <div>
// //           {!isEditing && (
// //             <button className="icon-btn" onClick={() => setIsEditing(true)}>
// //               <FaUserEdit /> Edit
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {!isEditing ? (
// //         <div className="profile-preview">
// //           {avatarUrl && (
// //             <img src={avatarUrl} alt="avatar" className="avatar-preview" />
// //           )}
// //           <h3>
// //             <a
// //               href={`http://localhost:5173/u/${username}`}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               style={{
// //                 color: "var(--color-secondary-vibrant-blue)",
// //                 textDecoration: "none",
// //               }}
// //             >
// //               @{username}
// //             </a>
// //           </h3>
// //           <p>{bio}</p>

// //           <div className="links-preview">
// //             <h4>
// //               <FaLink /> Your Links
// //             </h4>
// //             <ul>
// //               {links.map((link, i) =>
// //                 link.url ? (
// //                   <li
// //                     key={i}
// //                     style={{ display: "flex", gap: "10px", fontSize: "1.05em" }}
// //                   >
// //                     <strong>{link.title || "Link"}:</strong>
// //                     <a
// //                       href={
// //                         link.url.startsWith("http")
// //                           ? link.url
// //                           : `https://${link.url}`
// //                       }
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       style={{ color: "var(--color-secondary-vibrant-blue)" }}
// //                     >
// //                       {link.url}
// //                     </a>
// //                   </li>
// //                 ) : null
// //               )}
// //             </ul>
// //           </div>
// //         </div>
// //       ) : (
// //         <>
// //           <div className="form-group">
// //             <label>Username:</label>
// //             <input
// //               type="text"
// //               value={username}
// //               placeholder="username"
// //               onChange={(e) => setUsername(e.target.value)}
// //             />
// //             <p style={{ fontSize: "0.85em", color: "gray" }}>
// //               Your public URL will be:{" "}
// //               <strong>linkhub.com/{username || "username"}</strong>
// //             </p>
// //           </div>

// //           <div className="form-group">
// //             <label>Profile Picture:</label>
// //             {uploadPreview || avatarUrl ? (
// //               <img
// //                 src={uploadPreview || avatarUrl}
// //                 alt="avatar"
// //                 className="avatar-preview"
// //               />
// //             ) : (
// //               <p>No image</p>
// //             )}
// //             <input type="file" accept="image/*" onChange={handleImageUpload} />
// //             <input
// //               type="text"
// //               value={avatarUrl}
// //               placeholder="https://example.com/image.jpg"
// //               onChange={(e) => {
// //                 setAvatarUrl(e.target.value);
// //                 setUploadPreview("");
// //               }}
// //             />
// //           </div>

// //           <div className="form-group">
// //             <label>Bio:</label>
// //             <textarea
// //               rows="3"
// //               value={bio}
// //               onChange={(e) => setBio(e.target.value)}
// //             />
// //           </div>

// //           <div className="form-group">
// //             <label>Your Links:</label>
// //             {links.map((link, i) => (
// //               <div key={i} className="link-row">
// //                 {i >= 4 && (
// //                   <input
// //                     type="text"
// //                     placeholder="Title"
// //                     value={link.title}
// //                     onChange={(e) => handleChange(i, "title", e.target.value)}
// //                   />
// //                 )}
// //                 <input
// //                   type="url"
// //                   placeholder="https:// - Enter your link"
// //                   value={link.url}
// //                   onChange={(e) => handleChange(i, "url", e.target.value)}
// //                 />
// //                 {i >= 4 && (
// //                   <button
// //                     className="delete-btn"
// //                     onClick={() => deleteLink(i)}
// //                   >
// //                     <FaTrash />
// //                   </button>
// //                 )}
// //               </div>
// //             ))}
// //             <button className="add-btn" onClick={addLink}>
// //               <FaPlus /> Add
// //             </button>
// //           </div>

// //           <button className="save-btn" onClick={handleSave}>
// //             <FaSave /> Submit
// //           </button>
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // export default Dashboard;



import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";
import { toast } from "react-toastify";
import { FaPlus, FaSave, FaLink, FaUserEdit, FaTrash } from "react-icons/fa";

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
  const [isNewUser, setIsNewUser] = useState(false); // ✅ new state

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const hasProfile =
          data.username || data.bio || (data.links && data.links.length > 0);

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
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setUploadPreview(previewURL);
      setAvatarUrl("");
    }
  };

  const allValidated = links.length > 0 && links.every((l) => l.validated);

  const handleSave = async () => {
    if (!allValidated) {
      toast.warn("Please validate all links before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = { username, bio, avatarUrl: avatarUrl || uploadPreview, links };

    const res = await fetch("http://localhost:5000/api/user/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Profile saved successfully!");
      setIsEditing(false);
      setIsNewUser(false); 
    } else {
      toast.error(data.message || "Failed to save profile");
    }
  };

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

      {!isEditing ? (
        <div className="profile-preview">
          {avatarUrl && <img src={avatarUrl} alt="avatar" className="avatar-preview" />}
          <h3>
            <a
              // href={`http://localhost:5173/u/${username}`}
              href={`http://localhost:5173/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-secondary-vibrant-blue)", textDecoration: "none" }}
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
                  <li key={i} style={{ display: "flex", gap: "10px", fontSize: "1.05em" }}>
                    <strong>{link.title || "Link"}:</strong>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-secondary-vibrant-blue)" }}
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
            disabled={!allValidated}
            style={{
              opacity: allValidated ? 1 : 0.6,
              cursor: allValidated ? "pointer" : "not-allowed",
            }}
          >
            <FaSave /> {isNewUser ? "Save Profile" : "Submit"}
          </button>
        </>
      )}
    </div>
  );
}

export default Dashboard;