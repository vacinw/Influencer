import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', // Spring Boot backend
 headers: {
 'Content-Type': 'application/json',
 },
 withCredentials: true, // Crucial for session cookies
});

// Request interceptor to add Bearer token
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => Promise.reject(error)
);

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

// --- Global Cache Implementation ---
const globalCache = new Map<string, { response: any, timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

const originalGet = api.get;
// @ts-ignore
api.get = async function (url: string, config?: any) {
 // Only cache common data fetching endpoints to be safe
 const isCacheableEndpoint = url.includes('/campaign') || url.includes('/job') || url.includes('/category');
 
 const key = url + (config?.params ? JSON.stringify(config.params) : '');
 const now = Date.now();
 
 if (isCacheableEndpoint && globalCache.has(key)) {
 const cached = globalCache.get(key)!;
 if (now - cached.timestamp < CACHE_TTL) {
 return Promise.resolve(cached.response);
 }
 }
 
 // @ts-ignore
 const response = await originalGet.call(this, url, config);
 
 if (isCacheableEndpoint) {
 globalCache.set(key, { response, timestamp: now });
 }
 return response;
};

// Intercept mutations to invalidate cache
const clearCache = () => globalCache.clear();
const originalPost = api.post;
// @ts-ignore
api.post = async function(url: string, data?: any, config?: any) {
 clearCache();
 // @ts-ignore
 return originalPost.call(this, url, data, config);
};
const originalPut = api.put;
// @ts-ignore
api.put = async function(url: string, data?: any, config?: any) {
 clearCache();
 // @ts-ignore
 return originalPut.call(this, url, data, config);
};
const originalDelete = api.delete;
// @ts-ignore
api.delete = async function(url: string, config?: any) {
 clearCache();
 // @ts-ignore
 return originalDelete.call(this, url, config);
};

export default api;
