import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import '../../styles/components.css';

const Register = () => {
  const [userType, setUserType] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    // Patient specific
    bloodGroup: '',
    // Doctor specific
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    hospitalName: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic',
    'Neurologist', 'Psychiatrist', 'General Physician', 'Gynecologist',
    'ENT Specialist', 'Ophthalmologist'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (userType === 'patient') {
        response = await authService.registerPatient({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
        });
      } else {
        response = await authService.registerDoctor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: parseInt(formData.experience),
          consultationFee: parseInt(formData.consultationFee),
          hospitalName: formData.hospitalName,
          bio: formData.bio,
        });
      }

      if (response.success) {
        login(response.data, response.data.token);
        navigate('/doctors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Register</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="form-group">
          <label>Register as:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="patient"
                checked={userType === 'patient'}
                onChange={(e) => setUserType(e.target.value)}
              />
              Patient
            </label>
            <label>
              <input
                type="radio"
                value="doctor"
                checked={userType === 'doctor'}
                onChange={(e) => setUserType(e.target.value)}
              />
              Doctor
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Common Fields */}
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Patient Specific Fields */}
          {userType === 'patient' && (
            <>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth:</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group:</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </>
          )}

          {/* Doctor Specific Fields */}
          {userType === 'doctor' && (
            <>
              <div className="form-group">
                <label htmlFor="specialization">Specialization:</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="qualification">Qualification:</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MBBS, MD"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience (years):</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Years of experience"
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultationFee">Consultation Fee (₹):</label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Consultation fee"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hospitalName">Hospital Name:</label>
                <input
                  type="text"
                  id="hospitalName"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  placeholder="Hospital/Clinic name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio:</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description about yourself"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
