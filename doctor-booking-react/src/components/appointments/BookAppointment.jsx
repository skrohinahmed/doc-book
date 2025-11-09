import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    selectedDay: '',
    timeSlot: null,
    reasonForVisit: '',
    symptoms: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role !== 'patient') {
      navigate('/login');
      return;
    }
    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    if (formData.appointmentDate && availability.length > 0) {
      const date = new Date(formData.appointmentDate);
      // Get day of week (Monday, Tuesday, etc.)
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      setFormData(prev => ({ ...prev, selectedDay: dayOfWeek, timeSlot: null }));
      
      // Find availability for selected day
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (dayAvailability && dayAvailability.slots) {
        setAvailableSlots(dayAvailability.slots);
      } else {
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [formData.appointmentDate, availability]);

  const fetchDoctorData = async () => {
    try {
      const [doctorRes, availRes] = await Promise.all([
        doctorService.getDoctor(doctorId),
        doctorService.getDoctorAvailability(doctorId),
      ]);
      
      if (doctorRes.success) {
        setDoctor(doctorRes.data);
      }
      
      if (availRes.success) {
        console.log('Availability data:', availRes.data); // Debug log
        setAvailability(availRes.data);
      }
    } catch (err) {
      setError('Failed to fetch doctor information.');
      console.error('Error fetching doctor data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isBooked) {
      setFormData(prev => ({
        ...prev,
        timeSlot: slot,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (!formData.timeSlot) {
      setError('Please select a time slot.');
      return;
    }

    if (!formData.reasonForVisit.trim()) {
      setError('Please provide a reason for visit.');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: {
          startTime: formData.timeSlot.startTime,
          endTime: formData.timeSlot.endTime,
        },
        reasonForVisit: formData.reasonForVisit,
        symptoms: formData.symptoms,
      };

      console.log('Booking appointment with data:', appointmentData); // Debug log

      const response = await appointmentService.bookAppointment(appointmentData);
      
      if (response.success) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="book-appointment-container">
      <div className="book-appointment-card">
        <h1>Book Appointment</h1>
        
        <div className="doctor-summary">
          <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
          <div>
            <h3>{doctor.name}</h3>
            <p>{doctor.specialization}</p>
            <p className="fee">Consultation Fee: ₹{doctor.consultationFee}</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="appointmentDate">Select Date: *</label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={today}
              max={maxDateStr}
              required
            />
            {formData.selectedDay && (
              <small className="info-text">Selected day: {formData.selectedDay}</small>
            )}
          </div>

          {formData.appointmentDate && (
            <>
              {availableSlots.length > 0 ? (
                <div className="form-group">
                  <label>Select Time Slot: *</label>
                  <div className="time-slots-grid">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`time-slot-btn ${
                          slot.isBooked ? 'booked' : ''
                        } ${
                          formData.timeSlot?.startTime === slot.startTime ? 'selected' : ''
                        }`}
                        disabled={slot.isBooked}
                      >
                        {slot.startTime} - {slot.endTime}
                        {slot.isBooked && <span className="booked-label">Booked</span>}
                      </button>
                    ))}
                  </div>
                  {formData.timeSlot && (
                    <small className="success-text">
                      Selected: {formData.timeSlot.startTime} - {formData.timeSlot.endTime}
                    </small>
                  )}
                </div>
              ) : (
                <div className="alert alert-info">
                  No available slots for {formData.selectedDay}. Please select a different date.
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="reasonForVisit">Reason for Visit: *</label>
            <input
              type="text"
              id="reasonForVisit"
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              required
              placeholder="e.g., Regular checkup, Consultation"
              maxLength="200"
            />
          </div>

          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (Optional):</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your symptoms or concerns"
              maxLength="1000"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !formData.timeSlot || !formData.appointmentDate}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify({ 
              selectedDate: formData.appointmentDate,
              selectedDay: formData.selectedDay,
              availableSlotsCount: availableSlots.length,
              selectedSlot: formData.timeSlot,
              totalAvailability: availability.length
            }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
