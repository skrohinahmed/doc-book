import api from './api';

export const patientService = {
  // Get patient profile
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Update patient profile
  updatePatient: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  // Add medical history
  addMedicalHistory: async (id, historyData) => {
    const response = await api.post(`/patients/${id}/medical-history`, historyData);
    return response.data;
  },

  // Delete patient account
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};
