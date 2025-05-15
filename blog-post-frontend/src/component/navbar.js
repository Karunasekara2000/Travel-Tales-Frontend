import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function NavBar({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("csrfToken");
        document.cookie = "jwt=; Max-Age=0; path=/;";
        navigate("/login");
    };

    return (
        <nav style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            {/* Left: Menu Links */}
            <div>
                <Link to="/" style={linkStyle}>Home</Link>
                <span onClick={() => {
                    if (user) {
                        navigate("/create-post");
                    } else {
                        navigate("/login", {state: {from: "/create-post"}});
                    }
                }} style={linkStyle}>Create Post</span>

                <span onClick={() => {
                    if (user) {
                        navigate("/my-posts");
                    } else {
                        navigate("/login", {state: {from: "/my-posts"}});
                    }
                }} style={linkStyle}>My Posts</span>
            </div>

            {/* Right: User Info and Auth Buttons */}
            <div>
                {user ? (
                    <>
                        <i className="bi bi-person-circle" style={{fontSize: "1.3rem", marginRight: "10px"}}></i>
                        <span style={{marginRight: "15px"}}>Hi, {user.username}</span>
                        <button onClick={handleLogout} style={btnStyle}>Logout</button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="login-register-btn"
                    >
                        <i className="bi bi-person-circle me-2"></i> Login/Register
                    </Link>
                )}
            </div>
        </nav>
    );
}

const linkStyle = {
    color: "#fff",
    marginRight: "15px",
    textDecoration: "none"
};

const btnStyle = {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px"
};

export default NavBar;
