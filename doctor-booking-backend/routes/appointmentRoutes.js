const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  bookAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  addPrescription,
  rescheduleAppointment,
  getUpcomingAppointments,
  getAppointmentHistory
} = require('../controllers/appointmentController');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/', protect, getAllAppointments);
router.get('/upcoming', protect, getUpcomingAppointments);
router.get('/history', protect, getAppointmentHistory);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/prescription', protect, authorize('doctor'), addPrescription);
router.put('/:id/reschedule', protect, rescheduleAppointment);

module.exports = router;
