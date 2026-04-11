import axios from "./axiosInstance";

export const createPaymentIntent = async (amount) => {
  const res = await axios.post("/v1/payment/create-payment-intent", {
    amount,
  });

  return res.data;
};