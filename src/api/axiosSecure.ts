import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const axiosSecure = axios.create({
  baseURL: "https://dictserver-main.vercel.app/",
});

axiosSecure.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      // Make sure headers is never undefined
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${authToken}`,
      } as AxiosRequestHeaders;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default axiosSecure;
