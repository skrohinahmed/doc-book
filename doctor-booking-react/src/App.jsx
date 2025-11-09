import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './components/home/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DoctorList from './components/doctors/DoctorList';
import DoctorDetails from './components/doctors/DoctorDetails';
import BookAppointment from './components/appointments/BookAppointment';
import AppointmentList from './components/appointments/AppointmentList';
import DoctorProfile from './components/profile/DoctorProfile';
import PatientProfile from './components/profile/PatientProfile';

// Styles
import './styles/App.css';
import './styles/components.css';
import './styles/dashboard.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              {/* Home Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Doctor Routes */}
              <Route path="/doctors" element={<DoctorList />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              
              {/* Patient Only Routes */}
              <Route 
                path="/book-appointment/:doctorId" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                } 
              />
              
              {/* Authenticated Routes */}
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute>
                    <AppointmentList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileRouter />
                  </ProtectedRoute>
                } 
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const ProfileRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'doctor') {
    return <DoctorProfile />;
  } else if (user?.role === 'patient') {
    return <PatientProfile />;
  }
  
  return <Navigate to="/login" replace />;
};

const NotFound = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
        Go to Home
      </a>
    </div>
  );
};

export default App;
