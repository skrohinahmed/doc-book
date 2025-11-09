const Doctor = require('../models/Doctor');
const Availability = require('../models/Availability');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, city, minExperience, maxFee, search, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { isActive: true };

    if (specialization) {
      query.specialization = specialization;
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (minExperience) {
      query.experience = { $gte: parseInt(minExperience) };
    }

    if (maxFee) {
      query.consultationFee = { $lte: parseInt(maxFee) };
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { hospitalName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    // Execute query with pagination
    const doctors = await Doctor.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    // Get total documents count
    const count = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: doctors
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Doctor only)
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if user is authorized
    if (doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ 
      doctorId: req.params.id,
      isActive: true 
    }).populate('doctorId', 'name specialization');

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Set/Update doctor availability
// @route   POST /api/doctors/:id/availability
// @access  Private (Doctor only)
exports.setDoctorAvailability = async (req, res) => {
  try {
    const { dayOfWeek, slots } = req.body;

    // Check if user is authorized
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if availability already exists for this day
    let availability = await Availability.findOne({
      doctorId: req.params.id,
      dayOfWeek
    });

    if (availability) {
      // Update existing availability
      availability.slots = slots;
      await availability.save();
    } else {
      // Create new availability
      availability = await Availability.create({
        doctorId: req.params.id,
        dayOfWeek,
        slots
      });
    }

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete doctor availability
// @route   DELETE /api/doctors/:id/availability/:availabilityId
// @access  Private (Doctor only)
exports.deleteDoctorAvailability = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.availabilityId);

    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability not found' });
    }

    // Check if user is authorized
    if (availability.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await availability.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:specialization
// @access  Public
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      specialization: req.params.specialization,
      isActive: true 
    }).select('-password').sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
