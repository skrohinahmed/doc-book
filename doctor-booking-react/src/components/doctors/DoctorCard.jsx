import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components.css';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/doctors/${doctor._id}`);
  };

  const handleBookAppointment = () => {
    navigate(`/book-appointment/${doctor._id}`);
  };

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          {doctor.name.charAt(0)}
        </div>
        <div className="doctor-info">
          <h3>{doctor.name}</h3>
          <p className="specialization">{doctor.specialization}</p>
          <p className="qualification">{doctor.qualification}</p>
        </div>
      </div>

      <div className="doctor-card-body">
        <div className="info-row">
          <span className="label">Experience:</span>
          <span className="value">{doctor.experience} years</span>
        </div>
        
        <div className="info-row">
          <span className="label">Consultation Fee:</span>
          <span className="value">₹{doctor.consultationFee}</span>
        </div>
        
        <div className="info-row">
          <span className="label">Hospital:</span>
          <span className="value">{doctor.hospitalName}</span>
        </div>

        {doctor.rating > 0 && (
          <div className="info-row">
            <span className="label">Rating:</span>
            <span className="value">
              ⭐ {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
            </span>
          </div>
        )}

        <div className="availability-badge">
          {doctor.isAvailable ? (
            <span className="badge badge-success">Available</span>
          ) : (
            <span className="badge badge-error">Not Available</span>
          )}
        </div>
      </div>

      <div className="doctor-card-footer">
        <button onClick={handleViewDetails} className="btn btn-secondary btn-sm">
          View Details
        </button>
        <button 
          onClick={handleBookAppointment} 
          className="btn btn-primary btn-sm"
          disabled={!doctor.isAvailable}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
