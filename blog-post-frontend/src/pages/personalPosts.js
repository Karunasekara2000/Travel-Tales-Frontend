import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "../service/baseService";
import NavBar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

function PersonalPosts() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [editPost, setEditPost] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [countryInfoMap, setCountryInfoMap] = useState({});
    const [countryList, setCountries] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [commentsMap, setCommentsMap] = useState({});
    const [visibleCommentPostId, setVisibleCommentPostId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchMyPosts(parsedUser.username);
            fetchFollows(parsedUser.id);
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchFollows = async (userId) => {
        try {
            const [followersRes, followingRes] = await Promise.all([
                axios.get(`/api/posts/followers/${userId}`),
                axios.get(`/api/posts/following/${userId}`)
            ]);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
        } catch (err) {
            console.error("Failed to fetch follow data", err);
        }
    };

    const handleUnfollow = async (targetId) => {
        try {
            await axios.delete(`/api/posts/follow/${targetId}`, {
                headers: {"x-csrf-token": localStorage.getItem("csrfToken")},
                withCredentials: true
            });
            setFollowing(prev => prev.filter(f => f.id !== targetId));
        } catch (err) {
            console.error("Unfollow failed", err);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/countries", {
                headers: {
                    "x-api-key": "cec6ce12-7296-4954-a32e-fa356300651c"
                }
            });

            const countryArray = response.data.countries || [];

            const formattedCountries = countryArray.map(country => ({
                name: country.name || "",
                capital: country.capital || "N/A",
                currencies: country.currencies || [],
                flag: country.flag || ""
            }));

            const sorted = formattedCountries.sort((a, b) => a.name.localeCompare(b.name));
            setCountries(sorted);
        } catch (err) {
            console.error("Failed to load country list", err);
        }
    };

    const toggleComments = async (postId) => {
        if (visibleCommentPostId === postId) {
            setVisibleCommentPostId(null); // Close comments
        } else {
            try {
                const res = await axios.get(`/api/posts/comments/${postId}`);
                setCommentsMap(prev => ({...prev, [postId]: res.data}));
                setVisibleCommentPostId(postId); // Show comments
            } catch (err) {
                console.error("Failed to fetch comments", err);
            }
        }
    };

    const fetchMyPosts = async (username) => {
        try {
            const res = await axios.get(`/api/posts?author=${username}`);
            const postsData = res.data.data || [];
            setPosts(postsData);

            // Fetch the country list only once
            const countriesRes = await axios.get("http://localhost:5000/api/countries", {
                headers: {
                    "x-api-key": "cec6ce12-7296-4954-a32e-fa356300651c"
                }
            });
            const countries = countriesRes.data.countries || [];

            // Create a map of country name -> details
            const countryInfo = {};
            countries.forEach(c => {
                countryInfo[c.name.toLowerCase()] = {
                    flag: c.flag || "",
                    capital: c.capital || "N/A",
                    currency: c.currencies?.[0]?.name || "N/A"
                };
            });

            // Collect unique country names from posts
            const uniqueCountries = [...new Set(postsData.map(p => p.countryCode.toLowerCase()))];

            // Map country details to used countries
            const mappedInfo = {};
            uniqueCountries.forEach(code => {
                mappedInfo[code] = countryInfo[code] || {
                    flag: "",
                    capital: "N/A",
                    currency: "N/A"
                };
            });

            setCountryInfoMap(mappedInfo);
        } catch (err) {
            console.error("Failed to fetch user's posts or country info", err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/api/posts/${postId}`, {
                headers: {"x-csrf-token": localStorage.getItem("csrfToken")},
                withCredentials: true
            });
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const openEditModal = (post) => {
        setEditPost({
            ...post,
            visitDate: post.visitDate.split("T")[0]
        });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const {name, value} = e.target;
        setEditPost(prev => ({...prev, [name]: value}));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = localStorage.getItem("csrfToken");

            await axios.put(`/api/posts/${editPost.id}`, {
                title: editPost.title,
                content: editPost.content,
                countryCode: editPost.countryCode,
                capital: editPost.capital,
                currency: editPost.currency,
                mediaUrl: editPost.mediaUrl,
                visitDate: editPost.visitDate
            }, {
                headers: {
                    "x-csrf-token": csrfToken,
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });
            setEditModalOpen(false);
            fetchMyPosts(user.username);
        } catch (err) {
            console.error("Update failed", err);
        }
    };


    return (
        <>
            <NavBar user={user}/>

            <div style={{backgroundColor: "#fdfbd4", paddingTop: "30px", paddingBottom: "30px"}}>
                <div style={{padding: "20px", maxWidth: "900px", margin: "0 auto"}}>
                    <h2 className="text-center mb-4 text-primary">
                        <i className="bi bi-journal-richtext me-2"></i>My Posts
                    </h2>

                    {/* Followers and Following Buttons */}
                    <div className="text-center mb-4">
                        <button className="btn btn-link text-decoration-none text-primary"
                                onClick={() => setShowFollowersModal(true)}>
                            <i className="bi bi-people-fill me-2"></i>
                            Followers <span className="badge bg-primary ms-1">{followers.length}</span>
                        </button>
                        <button className="btn btn-link text-decoration-none text-primary ms-4"
                                onClick={() => setShowFollowingModal(true)}>
                            <i className="bi bi-person-lines-fill me-2"></i>
                            Following <span className="badge bg-success ms-1">{following.length}</span>
                        </button>
                    </div>

                    {posts.length > 0 ? posts.map(post => {
                        const info = countryInfoMap[post.countryCode.toLowerCase()] || {};
                        return (
                            <div key={post.id} className="p-4 mb-4 bg-light rounded shadow">
                                <h4>{post.title}</h4>
                                <p><strong>Author:</strong> {post.authorUsername}</p>
                                <p><strong>Country:</strong> {post.countryCode} {info.flag &&
                                    <img src={info.flag} alt="flag" width="35" style={{marginLeft: "10px"}}/>}</p>
                                <p><strong>Capital:</strong> {info.capital}</p>
                                <p><strong>Currency:</strong> {info.currency}</p>
                                <p><strong>Date:</strong> {new Date(post.visitDate).toLocaleDateString()}</p>
                                <p><strong>Description:</strong> {post.content}</p>
                                <div className="d-flex gap-3 align-items-center mb-2">
                                <span className="badge bg-primary"><i
                                    className="bi bi-hand-thumbs-up me-1"></i>{post.likeCount || 0}</span>
                                    <span className="badge bg-danger"><i
                                        className="bi bi-hand-thumbs-down me-1"></i>{post.dislikeCount || 0}</span>

                                    <button className="btn btn-sm btn-outline-dark"
                                            onClick={() => toggleComments(post.id)}>
                                        <i className="bi bi-chat-left-text me-1"></i> View Comments
                                    </button>
                                </div>
                                {visibleCommentPostId === post.id && (
                                    <div className="mt-3">
                                        {commentsMap[post.id]?.length > 0 ? (
                                            commentsMap[post.id].map((comment) => (
                                                <div key={comment.id} className="mb-2">
                                                    <strong>{comment.author}</strong>: {comment.comment}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No comments yet.</p>
                                        )}
                                    </div>
                                )}
                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn btn-sm btn-outline-primary"
                                            onClick={() => openEditModal(post)}>
                                        <i className="bi bi-pencil-fill me-1"></i> Edit
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(post.id)}>
                                        <i className="bi bi-trash-fill me-1"></i> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    }) : <p className="text-center">You haven't posted anything yet.</p>}
                </div>
            </div>
                {/* Edit Modal */}
                {editModalOpen && editPost && (
                    <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.6)"}}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleEditSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Edit Post</h5>
                                        <button type="button" className="btn-close"
                                                onClick={() => setEditModalOpen(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-2">
                                            <label className="form-label">Title:</label>
                                            <input
                                                className="form-control"
                                                name="title"
                                                value={editPost.title}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="form-label">Content:</label>
                                            <textarea
                                                className="form-control"
                                                name="content"
                                                value={editPost.content}
                                                rows={4}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="form-label">Select Country:</label>
                                            <select
                                                className="form-select"
                                                name="countryCode"
                                                value={editPost.countryCode}
                                                onChange={(e) => {
                                                    const selectedName = e.target.value;
                                                    const selected = countryList.find(c => c.name === selectedName);
                                                    setEditPost(prev => ({
                                                        ...prev,
                                                        countryCode: selectedName,
                                                        capital: selected?.capital || "",
                                                        currency: selected?.currencies?.[0]?.name || "",
                                                        mediaUrl: selected?.flag || ""
                                                    }));
                                                }}
                                                required
                                            >
                                                <option value="">-- Select Country --</option>
                                                {countryList.map((c, idx) => (
                                                    <option key={idx} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {editPost.capital && (
                                            <div className="mb-2">
                                                <label className="form-label">Capital:</label>
                                                <p>{editPost.capital}</p>
                                            </div>
                                        )}

                                        {editPost.currency && (
                                            <div className="mb-2">
                                                <label className="form-label">Currency:</label>
                                                <p>{editPost.currency}</p>
                                            </div>
                                        )}

                                        {editPost.mediaUrl && (
                                            <div className="mb-2">
                                                <label className="form-label">Flag:</label>
                                                <br/>
                                                <img src={editPost.mediaUrl} alt="flag" width="80" className="mt-1"/>
                                            </div>
                                        )}

                                        <div className="mb-2">
                                            <label className="form-label">Date of Visit:</label>
                                            <input
                                                className="form-control"
                                                type="date"
                                                name="visitDate"
                                                value={editPost.visitDate}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-success">Save Changes</button>
                                        <button type="button" className="btn btn-secondary"
                                                onClick={() => setEditModalOpen(false)}>Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Followers Modal */}
                {showFollowersModal && (
                    <div className="modal d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Followers</h5>
                                    <button type="button" className="btn-close"
                                            onClick={() => setShowFollowersModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {followers.length > 0 ? (
                                        <ul className="list-group">
                                            {followers.map(f => <li key={f.id}
                                                                    className="list-group-item">{f.username}</li>)}
                                        </ul>
                                    ) : <p className="text-muted">No followers yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Following Modal */}
                {showFollowingModal && (
                    <div className="modal d-block" tabIndex="-1" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Following</h5>
                                    <button type="button" className="btn-close"
                                            onClick={() => setShowFollowingModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {following.length > 0 ? (
                                        <ul className="list-group">
                                            {following.map(f => (
                                                <li key={f.id}
                                                    className="list-group-item d-flex justify-content-between align-items-center">
                                                    {f.username}
                                                    <button className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleUnfollow(f.id)}>
                                                        <i className="bi bi-person-dash me-1"></i>Unfollow
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-muted">Not following anyone yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
            );
            }

            export default PersonalPosts;
