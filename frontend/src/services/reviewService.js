import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const submitReview = async (feedbackId, reviewData) => {
  const response = await axios.post(
    `${baseUrl}/feedbacks/${feedbackId}/createReview`,
    reviewData,
    getAuthHeaders(),
  );
  return response.data.review;
};

export const getReviews = async () => {
  const response = await axios.get(
    `${baseUrl}/feedbacks/fetchReviews`,
    getAuthHeaders(),
  );
  return response.data.reviews || [];
};

export const editReview = async (reviewId, updatedData) => {
  const response = await axios.put(
    `${baseUrl}/feedbacks/updateReview/${reviewId}`,
    updatedData,
    getAuthHeaders(),
  );
  return response.data.review;
};

export const deleteReview = async (reviewId) => {
  const response = await axios.delete(
    `${baseUrl}/feedbacks/deleteReview/${reviewId}`,
    getAuthHeaders(),
  );
  return response.data.review;
};
