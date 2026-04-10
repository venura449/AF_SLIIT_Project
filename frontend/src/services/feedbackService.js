import { api } from "./authService";
import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "https://af-sliit-project.onrender.com/api/v1";

export const submitFeedback = async (feedbackData) => {
  const response = await api.post(
    `${baseUrl}/feedbacks/createFeedback`,
    feedbackData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );
  return response.data.savedFeedback;
};

export const getFeedbacks = async () => {
  // Public endpoint — no auth needed
  const response = await axios.get(`${baseUrl}/feedbacks/fetchFeedbacks`);
  return response.data.feedbacks || [];
};

export const deleteFeedback = async (feedbackId) => {
  const response = await api.delete(`${baseUrl}/feedbacks/deleteFeedback/${feedbackId}`);
  return response.data.deletedFeedback;
};

export const editFeedback = async (feedbackId, updatedData) => {
  const response = await api.put(
    `${baseUrl}/feedbacks/updateFeedback/${feedbackId}`,
    updatedData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );
  return response.data.updatedFeedback;
};
