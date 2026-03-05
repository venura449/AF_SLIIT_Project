import axios from 'axios';
import { get } from 'mongoose';

const baseUrl = import.meta.env.VITE_API_URL;

const getAuthConfig = () =>{
    const token = localStorage.getItem("token");
    return {
        headers:{Authorization:`Bearer ${token}`}
    };

};

export const getAllNeeds = async(category = 'all')=>{
    const query = category !== 'all' ? `?category=${category}` : '';
    const response = await axios.get(`${APIT_URL}/getall${query}`);
    return response.data.data;
};

export const createNeed = async(needData) =>{
    const response = await axios.post(`${VITE_API_URL}/create`,needData,getAuthConfig());
    return response.data.data;
};

export const updateNeed = async(needId, needData)=>{
    const response = await axios.put(`${VITE_API_URL}/update/${needId}`,needData,getAuthConfig());
    return response.data.data;
};