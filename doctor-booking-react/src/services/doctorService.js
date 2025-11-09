import api from './api';

export const doctorService = {
  // Get all doctors with filters
  getAllDoctors: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/doctors?${params}`);
    return response.data;
  },

  // Get single doctor
  getDoctor: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  // Update doctor profile
  updateDoctor: async (id, data) => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },

  // Get doctor availability
  getDoctorAvailability: async (id) => {
    const response = await api.get(`/doctors/${id}/availability`);
    return response.data;
  },

  // Set doctor availability
  setDoctorAvailability: async (id, availabilityData) => {
    const response = await api.post(`/doctors/${id}/availability`, availabilityData);
    return response.data;
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization) => {
    const response = await api.get(`/doctors/specialization/${specialization}`);
    return response.data;
  },
  // Delete doctor availability
  deleteDoctorAvailability: async (doctorId, availabilityId) => {
    const response = await api.delete(`/doctors/${doctorId}/availability/${availabilityId}`);
    return response.data;
  },
};
  
