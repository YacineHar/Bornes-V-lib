import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const login = (credentials) => {
    return api.post('/login', credentials);
};

export const getStations = (lat, lon, radius = 0.01, address = null) => {
    const params = {};
    if (address) {
        params.address = address;
    } else if (lat !== undefined && lon !== undefined) {
        params.lat = lat;
        params.lon = lon;
        params.radius = radius;
    }
    return api.get('/stations', { params });
};

export const geocodeAddress = (address) => {
    return api.get('/geocode', { params: { address } });
};

export const createStation = (data) => {
    return api.post('/stations', data);
};

export const updateStation = (id, data) => {
    return api.put(`/stations/${id}`, data);
};

export const deleteStation = (id) => {
    return api.delete(`/stations/${id}`);
};

export default api;
