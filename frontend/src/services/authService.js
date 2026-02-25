import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

//Auth API methods
export const signup = async (username, email, password, role) => {
  const response = await api.post("/auth/signup", {
    username,
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

//User Profile API methods
export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

export const deleteProfile = async () => {
  const response = await api.delete("/auth/profile");
  return response.data;
};

// Admin API methods
export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await api.put(`/users/${userId}/status`, { isActive });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Document Upload API methods
export const uploadNicDocument = async (formData) => {
  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDocumentStatus = async () => {
  const response = await api.get("/documents/status");
  return response.data;
};

// Admin Document Verification API methods
export const getPendingDocuments = async () => {
  const response = await api.get("/documents/admin/pending");
  return response.data;
};

export const getUnverifiedUsers = async () => {
  const response = await api.get("/documents/admin/unverified");
  return response.data;
};

export const verifyUserDocument = async (
  userId,
  approve,
  rejectionReason = "",
) => {
  const response = await api.put(`/documents/admin/verify/${userId}`, {
    approve,
    rejectionReason,
  });
  return response.data;
};

export const getUserDocumentUrl = (userId) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return `${API_URL}/documents/admin/document/${userId}?token=${token}`;
};

export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

export const isAuthenticated = () => {
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
};

export default api;
