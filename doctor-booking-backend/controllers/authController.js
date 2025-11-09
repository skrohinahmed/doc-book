const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register a new patient
// @route   POST /api/auth/patient/register
// @access  Public
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address, bloodGroup } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findOne({ email });

    if (patientExists) {
      return res.status(400).json({ success: false, message: 'Patient already exists' });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup
    });

    if (patient) {
      res.status(201).json({
        success: true,
        data: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          role: patient.role,
          token: generateToken(patient._id, patient.role)
        }
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Register a new doctor
// @route   POST /api/auth/doctor/register
// @access  Public
exports.registerDoctor = async (req, res) => {
  try {
    const { 
      name, email, password, phone, specialization, qualification, 
      experience, gender, consultationFee, hospitalName, address, bio 
    } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({ success: false, message: 'Doctor already exists' });
    }

    // Create doctor
    const doctor = await Doctor.create({
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      gender,
      consultationFee,
      hospitalName,
      address,
      bio
    });

    if (doctor) {
      res.status(201).json({
        success: true,
        data: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
          role: doctor.role,
          token: generateToken(doctor._id, doctor.role)
        }
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login patient
// @route   POST /api/auth/patient/login
// @access  Public
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for patient
    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        role: patient.role,
        token: generateToken(patient._id, patient.role)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login doctor
// @route   POST /api/auth/doctor/login
// @access  Public
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for doctor
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        role: doctor.role,
        token: generateToken(doctor._id, doctor.role)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
