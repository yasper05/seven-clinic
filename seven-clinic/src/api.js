import axios from 'axios';

/**
 * Cria uma instância do axios que automaticamente injeta o token JWT
 * de autenticação em todas as requisições que precisam de autenticação.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: adiciona o token JWT em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: se o token expirar (403), força logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
            // Token expirado: limpa a sessão e redireciona para login
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
