import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import '../../styles/components.css';

const DoctorAvailability = ({ doctorId }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  useEffect(() => {
    fetchAvailability();
  }, [doctorId]);

  const fetchAvailability = async () => {
    try {
      const response = await doctorService.getDoctorAvailability(doctorId);
      if (response.success) {
        console.log('Fetched availability:', response.data);
        setAvailability(response.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const getDayAvailability = (day) => {
    return availability.find(a => a.dayOfWeek === day);
  };

  const handleAddSlot = (day) => {
    console.log('Adding slot for:', day);
    const dayAvail = getDayAvailability(day);
    const newSlot = { 
      startTime: '09:00', 
      endTime: '09:30', 
      isBooked: false 
    };

    if (dayAvail) {
      // Day exists, add slot to existing day
      const updatedAvailability = availability.map(a => {
        if (a.dayOfWeek === day) {
          return {
            ...a,
            slots: [...a.slots, newSlot]
          };
        }
        return a;
      });
      setAvailability(updatedAvailability);
      console.log('Added slot to existing day');
    } else {
      // Day doesn't exist, create new day with slot
      const newDayAvailability = {
        dayOfWeek: day,
        slots: [newSlot],
        isActive: true,
        isNew: true // Flag to indicate this is unsaved
      };
      setAvailability([...availability, newDayAvailability]);
      console.log('Created new day with slot');
    }
  };

  const handleRemoveSlot = (day, index) => {
    console.log('Removing slot:', day, index);
    const updatedAvailability = availability.map(a => {
      if (a.dayOfWeek === day) {
        const newSlots = a.slots.filter((_, i) => i !== index);
        return {
          ...a,
          slots: newSlots
        };
      }
      return a;
    }).filter(a => a.slots.length > 0); // Remove day if no slots left

    setAvailability(updatedAvailability);
  };

  const handleSlotChange = (day, index, field, value) => {
    console.log('Changing slot:', day, index, field, value);
    const updatedAvailability = availability.map(a => {
      if (a.dayOfWeek === day) {
        const newSlots = [...a.slots];
        newSlots[index] = {
          ...newSlots[index],
          [field]: value
        };
        return {
          ...a,
          slots: newSlots
        };
      }
      return a;
    });
    setAvailability(updatedAvailability);
  };

  const validateSlots = (slots) => {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      
      // Check if end time is after start time
      if (slot.startTime >= slot.endTime) {
        return { valid: false, message: 'End time must be after start time' };
      }

      // Check for overlapping slots
      for (let j = i + 1; j < slots.length; j++) {
        const otherSlot = slots[j];
        if (
          (slot.startTime >= otherSlot.startTime && slot.startTime < otherSlot.endTime) ||
          (slot.endTime > otherSlot.startTime && slot.endTime <= otherSlot.endTime) ||
          (slot.startTime <= otherSlot.startTime && slot.endTime >= otherSlot.endTime)
        ) {
          return { valid: false, message: 'Time slots cannot overlap' };
        }
      }
    }
    return { valid: true };
  };

  const handleSaveDay = async (day) => {
    console.log('Saving day:', day);
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dayAvail = getDayAvailability(day);
      
      if (!dayAvail || dayAvail.slots.length === 0) {
        setError('Please add at least one time slot');
        setSaving(false);
        return;
      }

      // Validate slots
      const validation = validateSlots(dayAvail.slots);
      if (!validation.valid) {
        setError(validation.message);
        setSaving(false);
        return;
      }

      // Sort slots by start time
      const sortedSlots = [...dayAvail.slots].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      const response = await doctorService.setDoctorAvailability(doctorId, {
        dayOfWeek: day,
        slots: sortedSlots
      });

      if (response.success) {
        setSuccess(`✓ Availability saved for ${day}!`);
        await fetchAvailability(); // Refresh data from server
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDay = async (day, availabilityId) => {
    if (!window.confirm(`Are you sure you want to delete all time slots for ${day}?`)) {
      return;
    }

    if (!availabilityId) {
      // Just remove from local state if not saved yet
      setAvailability(availability.filter(a => a.dayOfWeek !== day));
      return;
    }

    setSaving(true);
    setError('');

    try {
      await doctorService.deleteDoctorAvailability(doctorId, availabilityId);
      setSuccess(`✓ Availability deleted for ${day}`);
      await fetchAvailability();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete availability');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSetup = (day) => {
    const morningSlots = [
      { startTime: '09:00', endTime: '09:30', isBooked: false },
      { startTime: '09:30', endTime: '10:00', isBooked: false },
      { startTime: '10:00', endTime: '10:30', isBooked: false },
      { startTime: '10:30', endTime: '11:00', isBooked: false },
      { startTime: '11:00', endTime: '11:30', isBooked: false },
      { startTime: '11:30', endTime: '12:00', isBooked: false }
    ];

    const afternoonSlots = [
      { startTime: '14:00', endTime: '14:30', isBooked: false },
      { startTime: '14:30', endTime: '15:00', isBooked: false },
      { startTime: '15:00', endTime: '15:30', isBooked: false },
      { startTime: '15:30', endTime: '16:00', isBooked: false },
      { startTime: '16:00', endTime: '16:30', isBooked: false },
      { startTime: '16:30', endTime: '17:00', isBooked: false }
    ];

    const allSlots = [...morningSlots, ...afternoonSlots];

    const dayAvail = getDayAvailability(day);
    if (dayAvail) {
      const updatedAvailability = availability.map(a => {
        if (a.dayOfWeek === day) {
          return { ...a, slots: allSlots };
        }
        return a;
      });
      setAvailability(updatedAvailability);
    } else {
      setAvailability([...availability, {
        dayOfWeek: day,
        slots: allSlots,
        isActive: true,
        isNew: true
      }]);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h2>Manage Availability</h2>
        <p className="info-text">
          Set your available time slots for each day of the week. Patients can only book appointments during these slots.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="availability-days">
        {weekdays.map(day => {
          const dayAvail = getDayAvailability(day);
          const hasSlots = dayAvail && dayAvail.slots.length > 0;
          const isUnsaved = dayAvail?.isNew || false;

          return (
            <div key={day} className={`day-card ${hasSlots ? 'has-slots' : ''}`}>
              <div className="day-header">
                <h3>
                  {day}
                  {isUnsaved && <span className="unsaved-badge">Unsaved</span>}
                </h3>
                <div className="day-actions">
                  {hasSlots ? (
                    <>
                      <span className="badge badge-success">
                        {dayAvail.slots.length} slot{dayAvail.slots.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleDeleteDay(day, dayAvail._id)}
                        className="btn-icon btn-error"
                        disabled={saving}
                        title="Delete all slots for this day"
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span className="badge badge-secondary">No slots</span>
                  )}
                </div>
              </div>

              <div className="slots-container">
                {hasSlots && (
                  <>
                    {dayAvail.slots.map((slot, index) => (
                      <div key={index} className="slot-row">
                        <select
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(day, index, 'startTime', e.target.value)}
                          className="time-select"
                          disabled={saving}
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span className="time-separator">to</span>
                        <select
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(day, index, 'endTime', e.target.value)}
                          className="time-select"
                          disabled={saving}
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day, index)}
                          className="btn-icon btn-error-outline"
                          title="Remove this slot"
                          disabled={saving}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
                )}

                <div className="slot-actions">
                  <button
                    type="button"
                    onClick={() => handleAddSlot(day)}
                    className="btn btn-secondary btn-sm"
                    disabled={saving}
                  >
                    + Add Time Slot
                  </button>
                  
                  {!hasSlots && (
                    <button
                      type="button"
                      onClick={() => handleQuickSetup(day)}
                      className="btn btn-secondary btn-sm"
                      disabled={saving}
                    >
                      ⚡ Quick Setup (9 AM - 5 PM)
                    </button>
                  )}
                  
                  {hasSlots && (
                    <button
                      type="button"
                      onClick={() => handleSaveDay(day)}
                      className="btn btn-primary btn-sm"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                  )}
                </div>
              </div>

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && hasSlots && (
                <div className="debug-info">
                  <small>Slots: {dayAvail.slots.length} | ID: {dayAvail._id || 'Not saved'}</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bulk-actions">
        <h3>Quick Actions</h3>
        <div className="bulk-actions-buttons">
          <button
            onClick={() => {
              if (window.confirm('Set default availability (9 AM - 5 PM) for all weekdays?')) {
                weekdays.slice(0, 5).forEach(day => handleQuickSetup(day));
              }
            }}
            className="btn btn-secondary"
            disabled={saving}
          >
            ⚡ Setup All Weekdays
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
