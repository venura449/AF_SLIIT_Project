import axios from "./axiosInstance";

export const createPaymentIntent = async (amount, needId) => {
  const res = await axios.post("/v1/payment/create-payment-intent", {
    amount,
    donationId: needId,
  });

  return res.data;
};