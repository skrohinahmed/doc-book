import api from './api';

export const authService = {
  // Patient Registration
  registerPatient: async (userData) => {
    const response = await api.post('/auth/patient/register', userData);
    return response.data;
  },

  // Doctor Registration
  registerDoctor: async (userData) => {
    const response = await api.post('/auth/doctor/register', userData);
    return response.data;
  },

  // Patient Login
  loginPatient: async (credentials) => {
    const response = await api.post('/auth/patient/login', credentials);
    return response.data;
  },

  // Doctor Login
  loginDoctor: async (credentials) => {
    const response = await api.post('/auth/doctor/login', credentials);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
