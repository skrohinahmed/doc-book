import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import '../../styles/components.css';

const AppointmentCard = ({ appointment, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'badge-success',
      completed: 'badge-info',
      cancelled: 'badge-error',
      rescheduled: 'badge-warning',
      'no-show': 'badge-error',
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a cancellation reason.');
      return;
    }

    setLoading(true);
    try {
      await appointmentService.cancelAppointment(appointment._id, cancellationReason);
      setShowCancelModal(false);
      onUpdate();
    } catch (err) {
      alert('Failed to cancel appointment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/appointments/${appointment._id}`);
  };

  const canCancel = ['scheduled', 'rescheduled'].includes(appointment.status);

  return (
    <>
      <div className="appointment-card">
        <div className="appointment-header">
          <div className="appointment-date">
            <span className="date">{new Date(appointment.appointmentDate).getDate()}</span>
            <span className="month">
              {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { month: 'short' })}
            </span>
          </div>
          
          <div className="appointment-info">
            <h3>{appointment.doctorId?.name || 'Dr. Unknown'}</h3>
            <p className="specialization">{appointment.doctorId?.specialization}</p>
            <p className="hospital">{appointment.doctorId?.hospitalName}</p>
          </div>

          <div className="appointment-status">
            <span className={getStatusBadge(appointment.status)}>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="appointment-body">
          <div className="appointment-details">
            <div className="detail-row">
              <span className="label">Date:</span>
              <span className="value">{formatDate(appointment.appointmentDate)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Time:</span>
              <span className="value">
                {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Reason:</span>
              <span className="value">{appointment.reasonForVisit}</span>
            </div>
            <div className="detail-row">
              <span className="label">Fee:</span>
              <span className="value">₹{appointment.consultationFee}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment:</span>
              <span className={`badge badge-sm ${
                appointment.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
              }`}>
                {appointment.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="appointment-footer">
          <button onClick={handleViewDetails} className="btn btn-secondary btn-sm">
            View Details
          </button>
          {canCancel && (
            <button 
              onClick={() => setShowCancelModal(true)} 
              className="btn btn-error btn-sm"
            >
              Cancel Appointment
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Appointment</h3>
            <p>Please provide a reason for cancellation:</p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows="4"
              placeholder="Enter cancellation reason"
              className="form-control"
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Close
              </button>
              <button 
                onClick={handleCancel} 
                className="btn btn-error"
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
