import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_SERVER_URL
});

export default apiClient;