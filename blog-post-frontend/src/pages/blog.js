import React, { useState, useEffect } from "react";
import axios from "../service/baseService";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Blog() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [countryName, setCountryName] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [error, setError] = useState("");
    const KEY = "cec6ce12-7296-4954-a32e-fa356300651c";

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/countries", {
                    headers: {
                        "x-api-key": KEY
                    }
                });
                const sorted = response.data.countries.sort((a, b) => a.name.localeCompare(b.name));
                setCountries(sorted);
            } catch (err) {
                console.error("Failed to fetch countries from microservice:", err);
            }
        };

        fetchCountries();
    }, []);

    const handleCountryChange = (e) => {
        const name = e.target.value;
        setCountryName(name);

        const country = countries.find(c => c.name === name);
        if (country) {
            setSelectedCountry({
                capital: country.capital,
                currency: country.currencies?.[0]?.name || "N/A",
                flag: country.flag
            });
        } else {
            setSelectedCountry(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = localStorage.getItem("csrfToken");

            await axios.post(
                "/api/posts",
                {
                    title,
                    content,
                    countryCode: countryName,
                    capital: selectedCountry?.capital || "",
                    currency: selectedCountry?.currency || "",
                    mediaUrl: selectedCountry?.flag || "",
                    visitDate
                },
                {
                    headers: { "x-csrf-token": csrfToken }
                }
            );
            navigate("/");
        } catch (err) {
            setError("Failed to create post. Are you logged in?");
            console.error(err);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#FDFBD4", paddingTop: "60px" }}>
            <div className="card shadow mx-auto" style={{ maxWidth: "700px" }}>
                <div className="card-body">
                    <h3 className="card-title mb-4 text-center">
                        <i className="bi bi-pencil-square me-2"></i>Create a Blog Post
                    </h3>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Content:</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                rows={6}
                                className="form-control"
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Select Country:</label>
                            <select
                                value={countryName}
                                onChange={handleCountryChange}
                                required
                                className="form-select"
                            >
                                <option value="">-- Select a country --</option>
                                {countries.map((c, idx) => (
                                    <option key={idx} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedCountry && (
                            <div className="mb-3">
                                <p><strong>Capital:</strong> {selectedCountry.capital}</p>
                                <p><strong>Currency:</strong> {selectedCountry.currency}</p>
                                <p>
                                    <strong>Flag:</strong><br />
                                    <img src={selectedCountry.flag} alt="flag" width="80" className="mt-1" />
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="form-label">Date of Visit:</label>
                            <input
                                type="date"
                                value={visitDate}
                                onChange={e => setVisitDate(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-send me-2"></i>Submit Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Blog;
