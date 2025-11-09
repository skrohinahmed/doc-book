import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/components.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Doctor Booking System
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/doctors">Find Doctors</Link></li>
          
          {user ? (
            <>
              <li><Link to="/appointments">My Appointments</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li>
                <span className="user-name">Hello, {user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
