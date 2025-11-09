import api from './api';

export const appointmentService = {
  // Book appointment
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Get all appointments
  getAllAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/appointments?${params}`);
    return response.data;
  },

  // Get single appointment
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments/upcoming');
    return response.data;
  },

  // Get appointment history
  getAppointmentHistory: async () => {
    const response = await api.get('/appointments/history');
    return response.data;
  },

  // Add prescription (doctor only)
  addPrescription: async (id, prescriptionData) => {
    const response = await api.put(`/appointments/${id}/prescription`, prescriptionData);
    return response.data;
  },
};
