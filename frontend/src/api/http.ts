import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from the Zustand auth store to every request.
// The store is persisted under the "patudos-auth" key, so reading
// localStorage.getItem('token') would not work reliably.
http.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle expired/invalid sessions globally.
http.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            useAuthStore.getState().logout();

            // Cleanup of old/previous storage keys used during development.
            localStorage.removeItem('token');
            localStorage.removeItem('utilizador');
            localStorage.removeItem('patudos_token');
            localStorage.removeItem('patudos_user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default http;