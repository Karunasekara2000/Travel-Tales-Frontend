import axios from "axios";

const baseApi = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,  // Important for JWT + CSRF cookies
});

export default baseApi;
