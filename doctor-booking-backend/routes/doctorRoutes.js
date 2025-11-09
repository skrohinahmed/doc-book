const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllDoctors,
  getDoctor,
  updateDoctor,
  getDoctorAvailability,
  setDoctorAvailability,
  deleteDoctorAvailability,
  getDoctorsBySpecialization
} = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctor);
router.put('/:id', protect, authorize('doctor'), updateDoctor);
router.get('/:id/availability', getDoctorAvailability);
router.post('/:id/availability', protect, authorize('doctor'), setDoctorAvailability);
router.delete('/:id/availability/:availabilityId', protect, authorize('doctor'), deleteDoctorAvailability);

module.exports = router;
