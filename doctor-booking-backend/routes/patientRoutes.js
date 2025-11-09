const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPatient,
  updatePatient,
  addMedicalHistory,
  deletePatient
} = require('../controllers/patientController');

router.get('/:id', protect, authorize('patient'), getPatient);
router.put('/:id', protect, authorize('patient'), updatePatient);
router.post('/:id/medical-history', protect, authorize('patient'), addMedicalHistory);
router.delete('/:id', protect, authorize('patient'), deletePatient);

module.exports = router;
