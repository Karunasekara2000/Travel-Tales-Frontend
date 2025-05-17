import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../component/navbar";
import axios from "../service/baseService";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

function HomePage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("country");
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

        fetchPosts();
    }, [searchTerm, filterType]);

    const fetchPosts = () => {
        const params = {};
        if (filterType === "country") params.country = searchTerm;
        else if (filterType === "user") params.author = searchTerm;

        axios.get("/api/posts", { params })
            .then(res => {
                if (Array.isArray(res.data.data)) {
                    setPosts(res.data.data);
                    res.data.data.forEach(post => loadComments(post.id));
                }
            })
            .catch(err => console.error("Error fetching posts:", err));
    };

    const handleLikeToggle = async (postId, hasLiked) => {
        if (!user) return navigate("/login");
        try {
            if (hasLiked) {
                await axios.delete(`/api/posts/like/${postId}`, {
                    headers: { "x-csrf-token": localStorage.getItem("csrfToken") },
                    withCredentials: true
                });
            } else {
                await axios.post(`/api/posts/like/${postId}`, {
                    user_id: user.id,
                    post_id: postId,
                    is_like: 1
                }, {
                    headers: { "x-csrf-token": localStorage.getItem("csrfToken") },
                    withCredentials: true
                });
            }
            window.location.reload();
        } catch (err) {
            console.error("Like toggle failed", err);
        }
    };

    const handleDislikeToggle = async (postId, hasDisliked) => {
        if (!user) return navigate("/login");
        try {
            if (hasDisliked) {
                await axios.delete(`/api/posts/like/${postId}`, {
                    headers: { "x-csrf-token": localStorage.getItem("csrfToken") },
                    withCredentials: true
                });
            } else {
                await axios.post(`/api/posts/like/${postId}`, {
                    user_id: user.id,
                    post_id: postId,
                    is_like: 0
                }, {
                    headers: { "x-csrf-token": localStorage.getItem("csrfToken") },
                    withCredentials: true
                });
            }
            window.location.reload();
        } catch (err) {
            console.error("Dislike toggle failed", err);
        }
    };

    const handleFollow = async (authorId) => {
        if (!user) return navigate("/login");
        try {
            await axios.post(`/api/posts/follow/${authorId}`, {}, {
                headers: { "x-csrf-token": localStorage.getItem("csrfToken") }
            });
            alert("Followed successfully");
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const loadComments = async (postId) => {
        try {
            const res = await axios.get(`/api/posts/comments/${postId}`);
            setComments(prev => ({ ...prev, [postId]: res.data }));
        } catch (err) {
            console.error("Failed to load comments", err);
        }
    };

    const toggleComments = (postId) => {
        if (!user) return navigate("/login");
        setActiveCommentPostId(prev => prev === postId ? null : postId);
    };

    const handleCommentSubmit = async (postId) => {
        if (!user) return navigate("/login");
        try {
            await axios.post(`/api/posts/comments/${postId}`, { comment: newComment }, {
                headers: { "x-csrf-token": localStorage.getItem("csrfToken") }
            });
            setNewComment("");
            loadComments(postId);
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const filteredPosts = posts.filter(post => {
        if (filterType === "country") {
            return post.countryCode.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            return post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });

    return (
        <>
            <NavBar user={user} />
            <div style={{ minHeight: "100vh", backgroundColor: "#fdfbd4", paddingTop: "30px", paddingBottom: "30px" }}>
                <div className="container" style={{ maxWidth: "900px" }}>
                    <h1 className="text-center mb-4 text-dark">
                        <i className="bi bi-globe2 me-2"></i>TravelTales: Global Stories
                    </h1>

                    <div className="d-flex gap-2 mb-4">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select" style={{ width: '200px' }}>
                            <option value="country">Search by Country</option>
                            <option value="user">Search by User</option>
                        </select>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={`Search by ${filterType}`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredPosts.length > 0 ? filteredPosts.map(post => {
                        const hasLiked = post.likeCount > 0;
                        const hasDisliked = post.dislikeCount > 0;

                        return (
                            <div key={post.id} className="p-4 mb-4 bg-light rounded shadow">
                                <h2>{post.title}</h2>
                                <p><strong>Author:</strong> {post.authorUsername}
                                    {user && user.username !== post.authorUsername && (
                                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => handleFollow(post.authorId)}>👤 Follow</button>
                                    )}
                                </p>
                                <p>
                                    <strong>Country:</strong> {post.countryCode}
                                    {post.mediaUrl && (
                                        <img src={post.mediaUrl} alt="flag" width="40" style={{ marginLeft: "8px", verticalAlign: "middle" }} />
                                    )}
                                </p>
                                <p><strong>Capital:</strong> {post.capital || "N/A"}</p>
                                <p><strong>Currency:</strong> {post.currency || "N/A"}</p>
                                <p><strong>Date:</strong> {new Date(post.visitDate).toLocaleDateString()}</p>
                                <p>{post.content}</p>

                                <div className="d-flex gap-3 mt-2">
                                    <button className={`btn btn-sm ${hasLiked ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleLikeToggle(post.id, hasLiked)}>
                                        <i className="bi bi-hand-thumbs-up me-1"></i> {post.likeCount || 0}
                                    </button>
                                    <button className={`btn btn-sm ${hasDisliked ? "btn-danger" : "btn-outline-danger"}`} onClick={() => handleDislikeToggle(post.id, hasDisliked)}>
                                        <i className="bi bi-hand-thumbs-down me-1"></i> {post.dislikeCount || 0}
                                    </button>
                                    <button className="btn btn-sm btn-outline-dark" onClick={() => toggleComments(post.id)}>
                                        <i className="bi bi-chat-left-text me-1"></i> Comments
                                    </button>
                                </div>

                                {activeCommentPostId === post.id && (
                                    <div className="mt-3">
                                        {comments[post.id]?.map(c => (
                                            <div key={c.id} className="mb-2">
                                                <strong>{c.author}</strong>: {c.comment}
                                            </div>
                                        ))}
                                        <div className="d-flex mt-2">
                                            <input
                                                className="form-control me-2"
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <button className="btn btn-success" onClick={() => handleCommentSubmit(post.id)}>
                                                <i className="bi bi-send-fill me-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <p className="text-center">No matching blog posts found.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default HomePage;
