import axios from "axios";
import dotenv from 'dotenv';
import { response } from "express";

dotenv.config();

const nibssClient = axios.create({
    baseURL: 'https://nibssbyphoenix.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

let nibssToken = null;

export const loginFintech = async () => {
    try {
        const credentials = {
            apiKey: process.env.NIBSS_API_KEY,
            apiSecret: process.env.NIBSS_API_SECRET
        };

        const response = await axios.post('https://nibssbyphoenix.onrender.com/api/auth/token', credentials);

        nibssToken = response.data.token || response.data.data.token;
        return nibssToken;
    } catch (error) {
        console.error('NIBSS Authentication failed:', error.response?.data || error.message);
        throw new Error('Failed to authenicate with external banking system');
    }
};

nibssClient.interceptors.request.use(async (config) => {
    if (!nibssToken) {
        await loginFintech();
    }
    config.headers.Authorization = `Bearer ${nibssToken}`;
    return config;
}, (error) => {
    return Promise.reject(error)
});

nibssClient.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        await loginFintech();
        originalRequest.headers.Authorization = `Bearer ${nibssToken}`;
        return nibssClient(originalRequest);
    }

    return Promise.reject(error);
});

export default nibssClient;