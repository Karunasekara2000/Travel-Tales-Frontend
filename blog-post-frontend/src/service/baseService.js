import axios from "axios";

const baseApi = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,  // Important for JWT + CSRF cookies
});

export default baseApi;
