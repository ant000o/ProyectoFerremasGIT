import axios from "axios";

const API = "http://localhost:8000";

export const login = async (credentials) => {
    const response = await axios.post(`${API}/login`, credentials);
    return response.data;
};

export const register = async (user) => {
    const response = await axios.post(`${API}/register`, user);
    return response.data;
};
