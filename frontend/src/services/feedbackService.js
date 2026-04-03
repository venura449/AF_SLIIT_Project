import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

const getAuthHeaders = (contentType) => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return { headers };
};

export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(
    `${baseUrl}/feedbacks/createFeedback`,
    feedbackData,
    getAuthHeaders(),
  );
  return response.data.savedFeedback;
};

export const getFeedbacks = async () => {
  const response = await axios.get(`${baseUrl}/feedbacks/fetchFeedbacks`);
  return response.data.feedbacks || [];
};

export const deleteFeedback = async (feedbackId) => {
  const response = await axios.delete(
    `${baseUrl}/feedbacks/deleteFeedback/${feedbackId}`,
    getAuthHeaders(),
  );
  return response.data.deletedFeedback;
};

export const editFeedback = async (feedbackId, updatedData) => {
  const response = await axios.put(
    `${baseUrl}/feedbacks/updateFeedback/${feedbackId}`,
    updatedData,
    getAuthHeaders(),
  );
  return response.data.updatedFeedback;
};
