const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Availability = require('../models/Availability');
const moment = require('moment');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.bookAppointment = async (req, res) => {
  try {
    const { 
      doctorId, 
      appointmentDate, 
      timeSlot, 
      reasonForVisit, 
      symptoms 
    } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if doctor is available
    if (!doctor.isAvailable) {
      return res.status(400).json({ success: false, message: 'Doctor is not available' });
    }

    // Get day of week from appointment date
    const dayOfWeek = moment(appointmentDate).format('dddd');

    // Check if slot is available
    const availability = await Availability.findOne({
      doctorId,
      dayOfWeek,
      'slots.startTime': timeSlot.startTime,
      'slots.endTime': timeSlot.endTime,
      'slots.isBooked': false
    });

    if (!availability) {
      return res.status(400).json({ success: false, message: 'Time slot not available' });
    }

    // Check if appointment already exists for this slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate).setHours(0, 0, 0),
        $lt: new Date(appointmentDate).setHours(23, 59, 59)
      },
      'timeSlot.startTime': timeSlot.startTime,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Appointment slot already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      symptoms,
      consultationFee: doctor.consultationFee
    });

    // Update availability slot
    await Availability.updateOne(
      {
        doctorId,
        dayOfWeek,
        'slots.startTime': timeSlot.startTime
      },
      {
        $set: { 'slots.$.isBooked': true }
      }
    );

    // Populate appointment details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone specialization hospitalName consultationFee');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (with filters)
// @route   GET /api/appointments
// @access  Private
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date
    if (date) {
      query.appointmentDate = {
        $gte: new Date(date).setHours(0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone gender dateOfBirth')
      .populate('doctorId', 'name email phone specialization hospitalName consultationFee')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, 'timeSlot.startTime': -1 });

    const count = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: appointments
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone gender dateOfBirth bloodGroup medicalHistory')
      .populate('doctorId', 'name email phone specialization qualification experience hospitalName consultationFee');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if user is authorized
    if (
      appointment.patientId._id.toString() !== req.user._id.toString() &&
      appointment.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment already cancelled' });
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    // Free up the slot
    const dayOfWeek = moment(appointment.appointmentDate).format('dddd');
    await Availability.updateOne(
      {
        doctorId: appointment.doctorId,
        dayOfWeek,
        'slots.startTime': appointment.timeSlot.startTime
      },
      {
        $set: { 'slots.$.isBooked': false }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add prescription to appointment
// @route   PUT /api/appointments/:id/prescription
// @access  Private (Doctor only)
exports.addPrescription = async (req, res) => {
  try {
    const { medicines, advice } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.prescription = { medicines, advice };
    appointment.status = 'completed';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if new slot is available
    const dayOfWeek = moment(appointmentDate).format('dddd');
    const availability = await Availability.findOne({
      doctorId: appointment.doctorId,
      dayOfWeek,
      'slots.startTime': timeSlot.startTime,
      'slots.endTime': timeSlot.endTime,
      'slots.isBooked': false
    });

    if (!availability) {
      return res.status(400).json({ success: false, message: 'Time slot not available' });
    }

    // Free up old slot
    const oldDayOfWeek = moment(appointment.appointmentDate).format('dddd');
    await Availability.updateOne(
      {
        doctorId: appointment.doctorId,
        dayOfWeek: oldDayOfWeek,
        'slots.startTime': appointment.timeSlot.startTime
      },
      {
        $set: { 'slots.$.isBooked': false }
      }
    );

    // Book new slot
    await Availability.updateOne(
      {
        doctorId: appointment.doctorId,
        dayOfWeek,
        'slots.startTime': timeSlot.startTime
      },
      {
        $set: { 'slots.$.isBooked': true }
      }
    );

    // Update appointment
    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    appointment.status = 'rescheduled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res) => {
  try {
    let query = {
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'rescheduled'] }
    };

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone specialization hospitalName')
      .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get appointment history
// @route   GET /api/appointments/history
// @access  Private
exports.getAppointmentHistory = async (req, res) => {
  try {
    let query = {
      appointmentDate: { $lt: new Date() }
    };

    // Filter by user role
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone specialization hospitalName')
      .sort({ appointmentDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
