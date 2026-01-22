import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';

// Create an instance of axios
const backendURL = import.meta.env.VITE_API_URL as string;
const axiosInstance = axios.create({
  baseURL: backendURL,
  timeout: 120000, // 2min
  headers: {
    'Content-Type': 'application/json'
    // Add other headers here if necessary
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add access token to request headers
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['access-token'] = token;
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful response
    return response;
  },
  async (error: AxiosError) => {
    // Handle response error
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      // console.error('Unauthorized, logging out...');
      // ! Todo Add your logout logic here
    }

    // Handle Blob error responses
    if (
      error.response &&
      error.response.data instanceof Blob &&
      error.response.headers['content-type']?.includes('application/json')
    ) {
      const data = await error.response.data.text();
      error.response.data = JSON.parse(data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
