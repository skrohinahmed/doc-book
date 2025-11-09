import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      fetchPublicData();
    }
  }, [user]);

  const fetchPublicData = async () => {
    try {
      const response = await doctorService.getAllDoctors({ limit: 6 });
      if (response.success) {
        setRecentDoctors(response.data);
      }
    } catch (err) {
      console.error('Error fetching public data:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user.role === 'patient') {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          appointmentService.getUpcomingAppointments(),
          doctorService.getAllDoctors({ limit: 4 })
        ]);
        
        if (appointmentsRes.success) {
          setUpcomingAppointments(appointmentsRes.data.slice(0, 4));
        }
        if (doctorsRes.success) {
          setRecentDoctors(doctorsRes.data);
        }
      } else if (user.role === 'doctor') {
        const appointmentsRes = await appointmentService.getAllAppointments({ limit: 100 });
        
        if (appointmentsRes.success) {
          const today = new Date().toDateString();
          const todayAppts = appointmentsRes.data.filter(apt => 
            new Date(apt.appointmentDate).toDateString() === today
          );
          
          setUpcomingAppointments(todayAppts.slice(0, 4));
          setStats({
            totalAppointments: appointmentsRes.total,
            todayAppointments: todayAppts.length,
            scheduledCount: appointmentsRes.data.filter(a => a.status === 'scheduled').length,
            completedCount: appointmentsRes.data.filter(a => a.status === 'completed').length
          });
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guest Dashboard - Simple & Clean
  if (!user) {
    return (
      <div className="landing-page">
        {/* Hero Section - Simple */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Find & Book Appointments with Qualified Doctors</h1>
                <p>Connect with healthcare professionals in your area. Book appointments online and manage your health records in one place.</p>
                <div className="hero-buttons">
                  <button onClick={() => navigate('/doctors')} className="btn btn-primary">
                    Browse Doctors
                  </button>
                  <button onClick={() => navigate('/register')} className="btn btn-outline">
                    Sign Up
                  </button>
                </div>
              </div>
              
              <div className="hero-image">
                <div className="image-placeholder">
                  <div className="placeholder-content">
                    <div className="doc-card">
                      <div className="doc-avatar">Dr</div>
                      <div className="doc-info">
                        <strong>Dr. Sarah Johnson</strong>
                        <span>Cardiologist</span>
                      </div>
                      <span className="available">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Minimal */}
        <section className="features">
          <div className="container">
            <h2>How It Works</h2>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-number">1</div>
                <h3>Search</h3>
                <p>Find doctors by specialty, location, or availability</p>
              </div>
              <div className="feature">
                <div className="feature-number">2</div>
                <h3>Book</h3>
                <p>Choose a time slot and book your appointment instantly</p>
              </div>
              <div className="feature">
                <div className="feature-number">3</div>
                <h3>Visit</h3>
                <p>Get reminders and manage all your appointments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specializations */}
        <section className="specializations">
          <div className="container">
            <h2>Popular Specializations</h2>
            <div className="spec-grid">
              {[
                'Cardiologist', 'Dermatologist', 'Pediatrician', 
                'Orthopedic', 'Neurologist', 'General Physician'
              ].map(spec => (
                <button 
                  key={spec}
                  onClick={() => navigate(`/doctors?specialization=${spec}`)}
                  className="spec-item"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Doctors */}
        {recentDoctors.length > 0 && (
          <section className="featured-doctors">
            <div className="container">
              <div className="section-header">
                <h2>Featured Doctors</h2>
                <button onClick={() => navigate('/doctors')} className="link-btn">
                  View All →
                </button>
              </div>
              <div className="doctors-list">
                {recentDoctors.map(doctor => (
                  <div key={doctor._id} className="doctor-item">
                    <div className="doctor-header">
                      <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                      <div className="doctor-info">
                        <h4>{doctor.name}</h4>
                        <p>{doctor.specialization}</p>
                        <span className="qualification">{doctor.qualification}</span>
                      </div>
                    </div>
                    <div className="doctor-meta">
                      <span>⭐ {doctor.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{doctor.experience} years</span>
                      <span>•</span>
                      <span>₹{doctor.consultationFee}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                      className="btn btn-small"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to get started?</h2>
              <p>Create a free account and book your first appointment today</p>
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Create Account
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Patient Dashboard - Clean & Functional
  if (user.role === 'patient') {
    return (
      <div className="dashboard">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <p className="subtitle">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h1>Welcome back, {user.name}</h1>
            </div>
            <button onClick={() => navigate('/doctors')} className="btn btn-primary">
              Book Appointment
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-label">Upcoming Appointments</div>
              <div className="stat-number">{upcomingAppointments.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">This Month</div>
              <div className="stat-number">12</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Doctors</div>
              <div className="stat-number">5</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="dashboard-grid">
            {/* Appointments */}
            <div className="card">
              <div className="card-header">
                <h3>Upcoming Appointments</h3>
                <button onClick={() => navigate('/appointments')} className="link-btn">
                  View all
                </button>
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="appointments">
                  {upcomingAppointments.map(apt => (
                    <div key={apt._id} className="appointment">
                      <div className="appointment-date">
                        <div className="date-day">
                          {new Date(apt.appointmentDate).getDate()}
                        </div>
                        <div className="date-month">
                          {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="appointment-details">
                        <h4>{apt.doctorId?.name}</h4>
                        <p>{apt.doctorId?.specialization}</p>
                        <span className="time">{apt.timeSlot.startTime} - {apt.timeSlot.endTime}</span>
                      </div>
                      <span className={`status ${apt.status}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  <p>No upcoming appointments</p>
                  <button onClick={() => navigate('/doctors')} className="btn btn-small">
                    Find a Doctor
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-links">
                  <button onClick={() => navigate('/doctors')} className="quick-link">
                    Find Doctors
                  </button>
                  <button onClick={() => navigate('/appointments')} className="quick-link">
                    My Appointments
                  </button>
                  <button onClick={() => navigate('/profile')} className="quick-link">
                    My Profile
                  </button>
                </div>
              </div>

              {recentDoctors.length > 0 && (
                <div className="card">
                  <h3>Suggested Doctors</h3>
                  <div className="suggested-list">
                    {recentDoctors.slice(0, 3).map(doctor => (
                      <div key={doctor._id} className="suggested-item">
                        <div className="doc-avatar-sm">{doctor.name.charAt(0)}</div>
                        <div className="doc-details">
                          <strong>{doctor.name}</strong>
                          <span>{doctor.specialization}</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/doctors/${doctor._id}`)}
                          className="btn-icon"
                        >
                          →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Doctor Dashboard
  if (user.role === 'doctor') {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <p className="subtitle">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h1>Dr. {user.name}</h1>
            </div>
            <button onClick={() => navigate('/profile')} className="btn btn-primary">
              Manage Availability
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-label">Today's Appointments</div>
              <div className="stat-number">{stats?.todayAppointments || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Scheduled</div>
              <div className="stat-number">{stats?.scheduledCount || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Completed</div>
              <div className="stat-number">{stats?.completedCount || 0}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Today's Schedule</h3>
              <button onClick={() => navigate('/appointments')} className="link-btn">
                View all
              </button>
            </div>
            {upcomingAppointments.length > 0 ? (
              <div className="appointments">
                {upcomingAppointments.map(apt => (
                  <div key={apt._id} className="appointment">
                    <div className="appointment-time-badge">
                      <div className="time-display">{apt.timeSlot.startTime}</div>
                      <div className="duration">{apt.timeSlot.endTime}</div>
                    </div>
                    <div className="appointment-details">
                      <h4>{apt.patientId?.name}</h4>
                      <p>{apt.reasonForVisit}</p>
                      {apt.symptoms && <span className="symptoms">{apt.symptoms}</span>}
                    </div>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>No appointments scheduled for today</p>
                <button onClick={() => navigate('/profile')} className="btn btn-small">
                  Set Availability
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
