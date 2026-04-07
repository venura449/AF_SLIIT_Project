import axios from "axios";
import { api } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL;
// Server origin for serving uploaded static files
const serverOrigin = baseUrl ? baseUrl.replace(/\/api\/v1$/, '') : '';

// Convert a local image path like /uploads/item_images/x.jpg to a full URL
export const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) return imgPath; // already a full URL (e.g. Cloudinary legacy)
  return `${serverOrigin}${imgPath}`;
};

// ---- Item Listings ----

export const createItem = async (formData) => {
  const response = await api.post(`${baseUrl}/items`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data || response.data;
};

export const getMyItems = async () => {
  const response = await api.get(`${baseUrl}/items/my-items`);
  return response.data.data || response.data;
};

export const getAvailableItems = async () => {
  const response = await api.get(`${baseUrl}/items/available`);
  return response.data.data || response.data;
};

export const getAllItems = async () => {
  const response = await api.get(`${baseUrl}/items/all`);
  return response.data.data || response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`${baseUrl}/items/${id}`);
  return response.data.data || response.data;
};

export const updateItem = async (id, data) => {
  const response = await api.put(`${baseUrl}/items/${id}`, data);
  return response.data.data || response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`${baseUrl}/items/${id}`);
  return response.data;
};

// ---- Messages ----

export const sendMessage = async ({ itemListingId, receiverId, content }) => {
  const response = await api.post(`${baseUrl}/messages`, { itemListingId, receiverId, content });
  return response.data.data || response.data;
};

export const getConversation = async (itemId) => {
  const response = await api.get(`${baseUrl}/messages/item/${itemId}`);
  return response.data.data || response.data;
};

export const getMyConversations = async () => {
  const response = await api.get(`${baseUrl}/messages/my-conversations`);
  return response.data.data || response.data;
};
