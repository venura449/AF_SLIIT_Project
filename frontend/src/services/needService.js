import { api } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL || "https://af-sliit-project.onrender.com/api/v1";

export const getAllNeeds = async (category = "all") => {
  const query = category !== "all" ? `?category=${category}` : "";
  const response = await api.get(`${baseUrl}/needs/getall${query}`);
  return response.data.data || response.data;
};

export const getMyRequests = async () => {
  const response = await api.get(`${baseUrl}/needs/my-needs`);
  return response.data.data || response.data;
};

export const createNeed = async (needData) => {
  const response = await api.post(`${baseUrl}/needs/create`, needData);
  return response.data.data || response.data;
};

export const uploadNeedDocs = async (needId, file) => {
  const formData = new FormData();
  formData.append("admin", file);
  const response = await api.patch(
    `${baseUrl}/needs/upload-verification/${needId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data || response.data;
};

export const updateNeed = async (needId, needData) => {
  const response = await api.put(`${baseUrl}/needs/update-need/${needId}`, needData);
  return response.data.data || response.data;
};

export const deleteNeed = async (needId) => {
  const response = await api.delete(`${baseUrl}/needs/delete/${needId}`);
  return response.data;
};

export const getPendingNeeds = async () => {
  const response = await api.get(`${baseUrl}/needs/pending`);
  return response.data.data || response.data;
};

export const approveNeed = async (needId) => {
  const response = await api.patch(`${baseUrl}/needs/approve/${needId}`, {});
  return response.data.data || response.data;
};

export const getAllNeedsAdmin = async () => {
  const response = await api.get(`${baseUrl}/needs/all-admin`);
  return response.data.data || response.data;
};
export const createPaymentIntent = (amount) => {
  return axios.post("/api/payment/create-payment-intent", { amount });
};

export const createDonation = async (donationData) => {
  const response = await api.post(`${baseUrl}/donation`, donationData);
  return response.data.data || response.data;
};

export const getDonationsByNeed = async (needId) => {
  const response = await api.get(`${baseUrl}/donation/by-need/${needId}`);
  return response.data.data || response.data;
};

export const getFulfilledNeeds = async () => {
  const response = await api.get(`${baseUrl}/donation/fulfilled-needs`);
  return response.data.data || response.data;
};

export const submitPlatformReview = async ({ content, rating }) => {
  const response = await api.post(`${baseUrl}/feedbacks/platform-review`, { content, rating });
  return response.data.data || response.data;
};

export const getPlatformReviews = async () => {
  const response = await api.get(`${baseUrl}/feedbacks/platform-reviews`);
  return response.data.data || response.data;
};

export const getMyDonations = async () => {
  const response = await api.get(`${baseUrl}/donation/my`);
  return response.data.data || response.data;
};
