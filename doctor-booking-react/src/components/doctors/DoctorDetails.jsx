import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import '../../styles/components.css';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorDetails();
    fetchDoctorAvailability();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await doctorService.getDoctor(id);
      if (response.success) {
        setDoctor(response.data);
      }
    } catch (err) {
      setError('Failed to fetch doctor details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAvailability = async () => {
    try {
      const response = await doctorService.getDoctorAvailability(id);
      if (response.success) {
        setAvailability(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const handleBookAppointment = () => {
    navigate(`/book-appointment/${id}`);
  };

  if (loading) {
    return <div className="loader-container"><div className="loader">Loading...</div></div>;
  }

  if (error || !doctor) {
    return <div className="alert alert-error">{error || 'Doctor not found'}</div>;
  }

  return (
    <div className="doctor-details-container">
      <div className="doctor-details-card">
        <div className="doctor-details-header">
          <div className="doctor-avatar-large">
            {doctor.name.charAt(0)}
          </div>
          <div className="doctor-details-info">
            <h1>{doctor.name}</h1>
            <p className="specialization-large">{doctor.specialization}</p>
            <p className="qualification-large">{doctor.qualification}</p>
            {doctor.rating > 0 && (
              <div className="rating-large">
                ⭐ {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
              </div>
            )}
          </div>
        </div>

        <div className="doctor-details-body">
          <section className="details-section">
            <h2>About</h2>
            <p>{doctor.bio || 'No bio available.'}</p>
          </section>

          <section className="details-section">
            <h2>Professional Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <strong>Experience:</strong>
                <span>{doctor.experience} years</span>
              </div>
              <div className="detail-item">
                <strong>Consultation Fee:</strong>
                <span>₹{doctor.consultationFee}</span>
              </div>
              <div className="detail-item">
                <strong>Gender:</strong>
                <span>{doctor.gender}</span>
              </div>
              <div className="detail-item">
                <strong>Hospital:</strong>
                <span>{doctor.hospitalName}</span>
              </div>
            </div>
          </section>

          <section className="details-section">
            <h2>Contact Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{doctor.email}</span>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <span>{doctor.phone}</span>
              </div>
              {doctor.address && (
                <div className="detail-item full-width">
                  <strong>Address:</strong>
                  <span>
                    {doctor.address.street}, {doctor.address.city}, {doctor.address.state} - {doctor.address.zipCode}
                  </span>
                </div>
              )}
            </div>
          </section>

          {availability.length > 0 && (
            <section className="details-section">
              <h2>Availability Schedule</h2>
              <div className="availability-list">
                {availability.map((avail) => (
                  <div key={avail._id} className="availability-item">
                    <h4>{avail.dayOfWeek}</h4>
                    <div className="time-slots">
                      {avail.slots.map((slot, index) => (
                        <span 
                          key={index} 
                          className={`time-slot ${slot.isBooked ? 'booked' : 'available'}`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="doctor-details-footer">
          <button onClick={() => navigate('/doctors')} className="btn btn-secondary">
            Back to List
          </button>
          <button 
            onClick={handleBookAppointment} 
            className="btn btn-primary"
            disabled={!doctor.isAvailable}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
