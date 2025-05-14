import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../service/baseService";

function Register() {
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
            await axios.post("/auth/register", form);
            const loginRes = await axios.post("/auth/login", form, { withCredentials: true });
            localStorage.setItem("user", JSON.stringify(loginRes.data.user));
            localStorage.setItem("csrfToken", loginRes.headers["x-csrf-token"]);
            setSuccess("Registration successful!");
            setTimeout(() => navigate(from), 1000);
        } catch (err) {
            if (err.response?.data?.error?.includes("UNIQUE constraint failed")) {
                setError("Username already exists");
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
            <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
                <h3 className="text-center mb-4">Sign up</h3>
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
                    <button type="submit" className="btn btn-primary w-100">Sign up</button>
                </form>
                <p className="text-center mt-3">
                    Already have an account?{" "}
                    <a href="/login" className="text-decoration-none">Sign in</a>
                </p>
            </div>
        </div>
    );
}

export default Register;
