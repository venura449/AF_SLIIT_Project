import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

// Helper to get the token and config
const getAuthConfig = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllNeeds = async (category = "all") => {
  const query = category !== "all" ? `?category=${category}` : "";
  // Note: ensure your backend response structure matches .data.data
  const response = await axios.get(`${baseUrl}/needs/getall${query}`);
  return response.data.data || response.data;
};

export const getMyRequests = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${baseUrl}/needs/my-needs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

export const createNeed = async (needData) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(`${baseUrl}/needs/create`, needData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.data || response.data;
};

export const uploadNeedDocs = async (needId, file) => {
  const token = sessionStorage.getItem("token");
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
    `${baseUrl}/needs/update/${needId}`,
    needData,
    getAuthConfig(),
  );
  return response.data.data || response.data;
};

export const getPendingNeeds = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${baseUrl}/needs/getall?category=Medical`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const allNeeds = response.data.data || [];
  return allNeeds.filter(need => need.category === "Medical" && !need.isVerified);
};

export const getPendingMedicalNeeds = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${baseUrl}/needs/getall?category=Medical`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const allNeeds = response.data.data || [];
  return allNeeds.filter(need => need.category === "Medical" && !need.isVerified);
};

// Call the verify endpoint
export const approveMedicalNeed = async (needId) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.patch(
    `${baseUrl}/needs/approve/${needId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
