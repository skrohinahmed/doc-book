const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerPatient,
  registerDoctor,
  loginPatient,
  loginDoctor,
  getMe
} = require('../controllers/authController');

router.post('/patient/register', registerPatient);
router.post('/doctor/register', registerDoctor);
router.post('/patient/login', loginPatient);
router.post('/doctor/login', loginDoctor);
router.get('/me', protect, getMe);

module.exports = router;
