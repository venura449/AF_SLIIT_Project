import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

// Helper to get the token and config
const getAuthConfig = () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllNeeds = async (category = "all") => {
  const query = category !== "all" ? `?category=${category}` : "";
  const response = await axios.get(`${baseUrl}/needs/getall${query}`);
  return response.data.data || response.data;
};

export const getMyRequests = async () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const response = await axios.get(
    `${baseUrl}/needs/my-needs`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data || response.data;
};

export const createNeed = async (needData) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const response = await axios.post(
    `${baseUrl}/needs/create`,
    needData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.data || response.data;
};

export const uploadNeedDocs = async (needId, file) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const formData = new FormData();
  formData.append("admin", file);

  const response = await axios.patch(
    `${baseUrl}/needs/upload-verification/${needId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data || response.data;
};

export const updateNeed = async (needId, needData) => {
  const response = await axios.put(
    `${baseUrl}/needs/update-need/${needId}`,
    needData,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const deleteNeed = async (needId) => {
  const response = await axios.delete(
    `${baseUrl}/needs/delete/${needId}`,
    getAuthConfig(),
  );
  return response.data;
};

export const getPendingNeeds = async () => {
  const response = await axios.get(
    `${baseUrl}/needs/pending`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const approveNeed = async (needId) => {
  const response = await axios.patch(
    `${baseUrl}/needs/approve/${needId}`,
    {},
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const createDonation = async (donationData) => {
  const response = await axios.post(
    `${baseUrl}/donation`,
    donationData,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getDonationsByNeed = async (needId) => {
  const response = await axios.get(
    `${baseUrl}/donation/by-need/${needId}`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getFulfilledNeeds = async () => {
  const response = await axios.get(
    `${baseUrl}/donation/fulfilled-needs`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const submitPlatformReview = async ({ content, rating }) => {
  const response = await axios.post(
    `${baseUrl}/feedbacks/platform-review`,
    { content, rating },
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getPlatformReviews = async () => {
  const response = await axios.get(
    `${baseUrl}/feedbacks/platform-reviews`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getMyDonations = async () => {
  const response = await axios.get(
    `${baseUrl}/donation/my`,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};
