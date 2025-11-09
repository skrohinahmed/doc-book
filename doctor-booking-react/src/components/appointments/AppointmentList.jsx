import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import AppointmentCard from './AppointmentCard';
import '../../styles/components.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await appointmentService.getAllAppointments();
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (err) {
      setError('Failed to fetch appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      return appointments.filter(apt => 
        new Date(apt.appointmentDate) >= now && 
        ['scheduled', 'rescheduled'].includes(apt.status)
      );
    } else if (filter === 'past') {
      return appointments.filter(apt => 
        new Date(apt.appointmentDate) < now || 
        ['completed', 'cancelled'].includes(apt.status)
      );
    }
    return appointments;
  };

  const filteredAppointments = filterAppointments();

  if (loading) {
    return <div className="loader-container"><div className="loader">Loading appointments...</div></div>;
  }

  return (
    <div className="appointments-container">
      <div className="page-header">
        <h1>My Appointments</h1>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({appointments.length})
        </button>
        <button
          className={`tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filteredAppointments.length === 0 ? (
        <div className="no-results">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onUpdate={fetchAppointments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
