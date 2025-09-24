import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaTachometerAlt } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="studyspot-header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            🎓 StudySpot PH
          </Link>
          
          <div className="navbar-nav ms-auto d-flex align-items-center">
            <Link className="nav-link" to="/">
              <FaHome className="me-1" /> Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link className="nav-link" to="/dashboard/my-bookings">
                  <FaTachometerAlt className="me-1" /> Dashboard
                </Link>
                <span className="nav-link">
                  <FaUser className="me-1" /> Welcome, {user?.name}
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </>
            ) : (
              <Link className="nav-link" to="/login">
                <FaUser className="me-1" /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;