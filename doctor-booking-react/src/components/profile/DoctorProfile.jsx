import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../services/doctorService';
import DoctorAvailability from './DoctorAvailability';
import '../../styles/components.css';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile or availability

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    consultationFee: '',
    hospitalName: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    isAvailable: true
  });

  useEffect(() => {
    if (user?._id) {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await doctorService.getDoctor(user._id);
      if (response.success) {
        setDoctor(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          consultationFee: response.data.consultationFee || '',
          hospitalName: response.data.hospitalName || '',
          bio: response.data.bio || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          isAvailable: response.data.isAvailable ?? true
        });
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await doctorService.updateDoctor(user._id, formData);
      if (response.success) {
        setDoctor(response.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original doctor data
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        phone: doctor.phone || '',
        consultationFee: doctor.consultationFee || '',
        hospitalName: doctor.hospitalName || '',
        bio: doctor.bio || '',
        address: doctor.address || {},
        isAvailable: doctor.isAvailable ?? true
      });
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader">Loading...</div></div>;
  }

  if (!doctor) {
    return <div className="alert alert-error">Doctor profile not found</div>;
  }

  return (
    <div className="doctor-profile-container">
      <div className="profile-header">
        <h1>Doctor Dashboard</h1>
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Availability
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {activeTab === 'profile' ? (
        <div className="profile-card">
          <div className="card-header">
            <h2>Profile Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            // View Mode
            <div className="profile-view">
              <div className="profile-section">
                <h3>Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{doctor.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{doctor.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Specialization:</label>
                    <span>{doctor.specialization}</span>
                  </div>
                  <div className="info-item">
                    <label>Qualification:</label>
                    <span>{doctor.qualification}</span>
                  </div>
                  <div className="info-item">
                    <label>Experience:</label>
                    <span>{doctor.experience} years</span>
                  </div>
                  <div className="info-item">
                    <label>Consultation Fee:</label>
                    <span>₹{doctor.consultationFee}</span>
                  </div>
                  <div className="info-item">
                    <label>Hospital:</label>
                    <span>{doctor.hospitalName}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Status:</label>
                    <span className={`badge ${doctor.isAvailable ? 'badge-success' : 'badge-error'}`}>
                      {doctor.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>About</h3>
                <p>{doctor.bio || 'No bio added yet.'}</p>
              </div>

              {doctor.address && (
                <div className="profile-section">
                  <h3>Address</h3>
                  <p>
                    {doctor.address.street && `${doctor.address.street}, `}
                    {doctor.address.city && `${doctor.address.city}, `}
                    {doctor.address.state && `${doctor.address.state} - `}
                    {doctor.address.zipCode}
                    {doctor.address.country && `, ${doctor.address.country}`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
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
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="consultationFee">Consultation Fee (₹):</label>
                    <input
                      type="number"
                      id="consultationFee"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      required
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    maxLength="500"
                    placeholder="Brief description about yourself and your practice"
                  />
                  <small>{formData.bio.length}/500 characters</small>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                    />
                    <span>Available for appointments</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <div className="form-group">
                  <label htmlFor="address.street">Street Address:</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City:</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.state">State:</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.zipCode">Zip Code:</label>
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.country">Country:</label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        // Availability Tab
        <DoctorAvailability doctorId={user._id} />
      )}
    </div>
  );
};

export default DoctorProfile;
