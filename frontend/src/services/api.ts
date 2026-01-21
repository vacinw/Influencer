import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Spring Boot backend
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for session cookies
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we are not already on the login page to avoid loops
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                // Redirect to login or dispatch logout action
                // For now, simple redirect
                // window.location.href = '/login'; 
                // Better handled in AuthContext or Router
            }
        }
        return Promise.reject(error);
    }
);

export default api;
