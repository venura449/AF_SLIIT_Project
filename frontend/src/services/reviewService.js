import { api } from "./authService";

const baseUrl = import.meta.env.VITE_API_URL || "https://af-sliit-project.onrender.com/api/v1";

export const submitReview = async (feedbackId, reviewData) => {
  const response = await api.post(
    `${baseUrl}/feedbacks/${feedbackId}/createReview`,
    reviewData,
  );
  return response.data.review;
};

export const getReviews = async () => {
  const response = await api.get(`${baseUrl}/feedbacks/fetchReviews`);
  return response.data.reviews || [];
};

export const editReview = async (reviewId, updatedData) => {
  const response = await api.put(
    `${baseUrl}/feedbacks/updateReview/${reviewId}`,
    updatedData,
  );
  return response.data.review;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`${baseUrl}/feedbacks/deleteReview/${reviewId}`);
  return response.data.review;
};
