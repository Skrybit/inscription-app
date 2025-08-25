import axios, { AxiosInstance } from 'axios';
import { isTokenExpired } from '../utils/token'; // Adjust path

interface AxiosInstanceOptions {
  baseURL?: string;
  multipart?: boolean;
}

export const createCustomAxiosInstance = (options: AxiosInstanceOptions): AxiosInstance => {
  const { baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.skrybit.io', multipart = false } = options;
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': multipart ? 'multipart/form-data' : 'application/json',
      'Accept': 'application/json',
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      if (config.data instanceof FormData) {
        console.log('Using FormData for request:', config.url);
        config.headers['Content-Type'] = 'multipart/form-data';
      }
      try {
        // Prefer the Authorization header from the incoming request
        const token = config.headers['authorization']?.replace('Bearer ', '') || config.headers['Authorization']?.replace('Bearer ', '');
        if (token) {
          if (!isTokenExpired(token)) {
            config.headers['authorization'] = `Bearer ${token}`;
          } else {
            console.log('Token expired');
            delete config.headers['authorization'];
          }
        } else {
          console.log('No auth token found in headers');
        }
        // console.log('Request headers:', config.headers);
        return config;
      } catch (error) {
        console.error('Error accessing auth token:', error);
        return config;
      }
    },
    (err) => Promise.reject(err)
  );

  return instance;
};

export const apiClient = createCustomAxiosInstance({});
export const apiLocalClient = createCustomAxiosInstance({ baseURL: '' });