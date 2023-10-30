import axios from 'axios';
import { hideLoader, showLoader } from './Redux/Actions';

export const Api = axios.create({
    baseURL: 'http://192.168.137.179:4000',
});

export const Api1 = axios.create({
    baseURL: 'http://192.168.137.179:4000',
}); +


    // Request interceptor for adding the bearer token
    Api1.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
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
        showLoader();
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
        console.log({ error });
        hideLoader();
        let message = error?.response?.data?.message || error?.message || 'Something went wrong'
        return Promise.reject(error?.response?.data);
    }
);

Api1.interceptors.response.use(
    (config) => {
        return config;
    },
    (error) => {
        console.log({ error });
        let message = error?.response?.data?.message || error?.message || 'Something went wrong';
        return Promise.reject(error?.response?.data || error);
    }
);




// Export the api instance