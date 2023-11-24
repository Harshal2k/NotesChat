import axios from 'axios';
import { hideLoader, showLoader } from './Redux/Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
const URL = 'https://noteschat-backend-service.onrender.com'

export const Api = axios.create({
    baseURL: URL,
});

export const Api1 = axios.create({
    baseURL: URL,
});


// Request interceptor for adding the bearer token
Api1.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token'); // Assuming you store the token in localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Request interceptor for adding the bearer token
Api.interceptors.request.use(
    async (config) => {
        showLoader({ show: true, text1: '', text2: '', gif: '' });
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

Api.interceptors.response.use(
    (config) => {
        hideLoader();
        return config
    },
    (error) => {
        hideLoader();
        return Promise.reject(error?.response?.data || error);
    }
);

Api1.interceptors.response.use(
    (config) => {
        return config;
    },
    (error) => {
        console.log({ error });
        return Promise.reject(error?.response?.data || error);
    }
);




// Export the api instance