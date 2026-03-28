import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;
// Server origin for serving uploaded static files
const serverOrigin = baseUrl.replace(/\/api\/v1$/, '');

const getAuthConfig = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Convert a local image path like /uploads/item_images/x.jpg to a full URL
export const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http')) return imgPath; // already a full URL (e.g. Cloudinary legacy)
  return `${serverOrigin}${imgPath}`;
};

// ---- Item Listings ----

export const createItem = async (formData) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(`${baseUrl}/items`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data || response.data;
};

export const getMyItems = async () => {
  const response = await axios.get(`${baseUrl}/items/my-items`, getAuthConfig());
  return response.data.data || response.data;
};

export const getAvailableItems = async () => {
  const response = await axios.get(`${baseUrl}/items/available`, getAuthConfig());
  return response.data.data || response.data;
};

export const getAllItems = async () => {
  const response = await axios.get(`${baseUrl}/items/all`, getAuthConfig());
  return response.data.data || response.data;
};

export const getItemById = async (id) => {
  const response = await axios.get(`${baseUrl}/items/${id}`, getAuthConfig());
  return response.data.data || response.data;
};

export const updateItem = async (id, data) => {
  const response = await axios.put(`${baseUrl}/items/${id}`, data, getAuthConfig());
  return response.data.data || response.data;
};

export const deleteItem = async (id) => {
  const response = await axios.delete(`${baseUrl}/items/${id}`, getAuthConfig());
  return response.data;
};

// ---- Messages ----

export const sendMessage = async ({ itemListingId, receiverId, content }) => {
  const response = await axios.post(
    `${baseUrl}/messages`,
    { itemListingId, receiverId, content },
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getConversation = async (itemId) => {
  const response = await axios.get(
    `${baseUrl}/messages/item/${itemId}`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getMyConversations = async () => {
  const response = await axios.get(
    `${baseUrl}/messages/my-conversations`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};
