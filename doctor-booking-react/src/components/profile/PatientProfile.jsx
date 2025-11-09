import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { patientService } from '../../services/patientService';
import '../../styles/components.css';

const PatientProfile = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (user?._id) {
      fetchPatientProfile();
    }
  }, [user]);

  const fetchPatientProfile = async () => {
    try {
      const response = await patientService.getPatient(user._id);
      if (response.success) {
        setPatient(response.data);
        
        // Format date for input
        const dob = response.data.dateOfBirth 
          ? new Date(response.data.dateOfBirth).toISOString().split('T')[0]
          : '';

        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          dateOfBirth: dob,
          gender: response.data.gender || 'male',
          bloodGroup: response.data.bloodGroup || '',
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
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
    const { name, value } = e.target;
    
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
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await patientService.updatePatient(user._id, formData);
      if (response.success) {
        setPatient(response.data);
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
    // Reset form data
    if (patient) {
      const dob = patient.dateOfBirth 
        ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
        : '';

      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        dateOfBirth: dob,
        gender: patient.gender || 'male',
        bloodGroup: patient.bloodGroup || '',
        address: patient.address || {}
      });
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return <div className="alert alert-error">Patient profile not found</div>;
  }

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-card">
        <div className="card-header">
          <h2>Personal Information</h2>
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
                  <label>Full Name:</label>
                  <span>{patient.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{patient.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{patient.phone}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>
                    {patient.dateOfBirth 
                      ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not provided'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Age:</label>
                  <span>
                    {patient.dateOfBirth 
                      ? `${calculateAge(patient.dateOfBirth)} years`
                      : 'Not calculated'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span className="text-capitalize">{patient.gender}</span>
                </div>
                <div className="info-item">
                  <label>Blood Group:</label>
                  <span>{patient.bloodGroup || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {patient.address && (
              <div className="profile-section">
                <h3>Address</h3>
                <p>
                  {patient.address.street && `${patient.address.street}, `}
                  {patient.address.city && `${patient.address.city}, `}
                  {patient.address.state && `${patient.address.state} - `}
                  {patient.address.zipCode}
                  {patient.address.country && `, ${patient.address.country}`}
                </p>
                {!patient.address.street && !patient.address.city && (
                  <p className="text-secondary">No address provided</p>
                )}
              </div>
            )}

            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <div className="profile-section">
                <h3>Medical History</h3>
                <div className="medical-history-list">
                  {patient.medicalHistory.map((history, index) => (
                    <div key={index} className="medical-history-item">
                      <div className="history-header">
                        <strong>{history.condition}</strong>
                        <span className="history-date">
                          {new Date(history.diagnosedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="history-notes">{history.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name: *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone: *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                    placeholder="10-digit phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth: *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender: *</label>
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

                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group:</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
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
                  placeholder="House/Flat number, Street name"
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
                    pattern="[0-9]{6}"
                    placeholder="6-digit PIN code"
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
                    placeholder="India"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn btn-secondary" 
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
