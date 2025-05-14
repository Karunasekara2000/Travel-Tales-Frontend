import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../service/baseService"; // make sure this has your baseURL + csrf interceptor

function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/auth/login", form, { withCredentials: true });
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("csrfToken", res.headers["x-csrf-token"]);
            setSuccess("Login successful!");
            setTimeout(() => navigate(from), 1000);
        } catch (err) {
            setSuccess("");
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
            <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
                <h3 className="text-center mb-4">Sign in</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input name="username" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" className="form-control" onChange={handleChange} required />
                    </div>
                    {success && <div className="alert alert-success text-center py-1">{success}</div>}
                    {error && <div className="alert alert-danger text-center py-1">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100">Sign in</button>
                </form>
                <p className="text-center mt-3">
                    Don’t have an account?{" "}
                    <a href="/register" state={{ from }} className="text-decoration-none">Sign up</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
