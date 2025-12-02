// src/api/client.ts
import axios, { AxiosRequestHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://dictserver-main.vercel.app',
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access-token');
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }

    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
