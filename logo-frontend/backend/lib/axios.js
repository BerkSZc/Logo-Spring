import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/rest/api",

  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const currentTenant = localStorage.getItem("tenant") || "logo";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Tenant-ID"] = currentTenant;

    console.log("Current tenant:", currentTenant);

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş
      localStorage.removeItem("token");
      window.location.href = "/login"; // otomatik yönlendirme
    }
    return Promise.reject(error);
  }
);
