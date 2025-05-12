import axios from "axios";

const API = "http://127.0.0.1:8000"; // Asegúrate de que FastAPI esté corriendo aquí

export const loginRequest = async (credentials) => {
    const response = await axios.post(`${API}/login`, credentials);
    return response.data;
};

export const registerRequest = async (userData) => {
    const response = await axios.post(`${API}/register`, userData);
    return response.data;
};
