import axios from "axios";

// Use the Render backend in production, localhost in development
const API = axios.create({
  baseURL: "https://profile-management-backend-qwee.onrender.com/api/users",
});

// Before every request, automatically attach the JWT token if one exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth calls
export const signupUser = (data) => API.post("/signup", data);
export const loginUser = (data) => API.post("/login", data);

// Profile calls
export const fetchProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile", data);

// Admin calls
export const fetchAllUsers = () => API.get("/");
export const deleteUser = (id) => API.delete(`/${id}`);
