import axios from 'axios';

/**
 * Axios instance que injeta o token JWT automaticamente.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de REQUEST: adiciona o token JWT se existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de RESPONSE: se o token expirar (403), força logout
// MAS só redireciona se NÃO estivermos já na página de login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isTokenError = error.response?.status === 403;
        const jaEstaNoLogin = window.location.pathname === '/login';

        if (isTokenError && !jaEstaNoLogin) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userLogado');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userLogado');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
