import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaCalendar, FaClock, FaUsers, FaTimes, FaExclamationTriangle, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import { spacesData } from '../../data/spaces';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserBookings, cancelBooking } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Use email instead of ID for persistent bookings
  const userBookings = getUserBookings(user?.email);

  // Get space details for each booking
  const enrichedBookings = userBookings.map(booking => {
    const space = spacesData.find(s => s.id === booking.spaceId);
    return {
      ...booking,
      spaceLocation: space?.location || 'Unknown Location',
      spaceImage: space?.main_image || '/space-1.jpg'
    };
  });

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedBooking) {
      cancelBooking(selectedBooking.id);
      setShowModal(false);
      setSelectedBooking(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Sort bookings by date and time
  const sortedBookings = enrichedBookings.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate} ${a.startTime}`);
    const dateB = new Date(`${b.bookingDate} ${b.startTime}`);
    return dateA - dateB;
  });

  // Separate active and past bookings
  const now = new Date();
  const activeBookings = sortedBookings.filter(booking => {
    const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
    return bookingDateTime >= now;
  });

  const pastBookings = sortedBookings.filter(booking => {
    const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
    return bookingDateTime < now;
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="welcome-section text-center mb-5 py-4 bg-light rounded">
          <h1 className="display-6">Welcome back, {user?.name}!</h1>
          <p className="lead text-muted">Manage your study space bookings</p>
          <div className="stats-row mt-3">
            <div className="row text-center">
              <div className="col-md-4">
                <h3 className="text-primary">{activeBookings.length}</h3>
                <small className="text-muted">Active Bookings</small>
              </div>
              <div className="col-md-4">
                <h3 className="text-success">{pastBookings.length}</h3>
                <small className="text-muted">Completed</small>
              </div>
              <div className="col-md-4">
                <h3 className="text-info">{sortedBookings.length}</h3>
                <small className="text-muted">Total Bookings</small>
              </div>
            </div>
          </div>
        </div>

        {sortedBookings.length === 0 ? (
          <div className="no-bookings text-center py-5">
            <FaExclamationTriangle size={64} className="text-muted mb-3" />
            <h3>No bookings yet</h3>
            <p className="text-muted">Start exploring study spaces and make your first booking!</p>
            <Link to="/" className="btn btn-primary btn-lg">Explore Spaces</Link>
          </div>
        ) : (
          <div className="bookings-sections">
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <div className="active-bookings mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="text-primary">
                    <FaCalendar className="me-2" />
                    Active Bookings ({activeBookings.length})
                  </h4>
                  <small className="text-muted">Upcoming and current bookings</small>
                </div>
                
                {activeBookings.map(booking => (
                  <div key={booking.id} className="booking-card card mb-4 shadow-sm border-primary">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <img 
                            src={booking.spaceImage} 
                            alt={booking.spaceName}
                            className="img-fluid rounded"
                            style={{height: '80px', width: '100%', objectFit: 'cover'}}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/200x80/007bff/ffffff?text=${encodeURIComponent(booking.spaceName)}`;
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <h5 className="card-title text-primary mb-1">{booking.spaceName}</h5>
                          <p className="text-muted mb-2">
                            <FaMapMarkerAlt className="me-1" />{booking.spaceLocation}
                          </p>
                          <div className="booking-details">
                            <p className="mb-1">
                              <FaCalendar className="me-2 text-muted" />
                              <strong>{new Date(booking.bookingDate).toLocaleDateString()}</strong>
                            </p>
                            <p className="mb-1">
                              <FaClock className="me-2 text-muted" />
                              {booking.startTime} - {booking.endTime}
                            </p>
                            <p className="mb-0">
                              <FaUsers className="me-2 text-muted" />
                              {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                              {booking.totalPrice && (
                                <span className="ms-3">
                                  <strong>₱{booking.totalPrice}</strong>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="badge bg-success fs-6 px-3 py-2">
                            CONFIRMED
                          </span>
                          <div className="mt-2">
                            <small className="text-muted">
                              {(() => {
                                const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
                                const diffTime = bookingDateTime - now;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays === 0) return 'Today';
                                if (diffDays === 1) return 'Tomorrow';
                                return `In ${diffDays} days`;
                              })()}
                            </small>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <Link 
                            to={`/space/${booking.spaceId}`} 
                            className="btn btn-outline-primary btn-sm mb-2 d-block"
                          >
                            <FaEdit className="me-1" /> Modify
                          </Link>
                          <button 
                            className="btn btn-outline-danger btn-sm d-block w-100"
                            onClick={() => handleCancelClick(booking)}
                          >
                            <FaTimes className="me-1" /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="past-bookings">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="text-muted">
                    <FaClock className="me-2" />
                    Past Bookings ({pastBookings.length})
                  </h4>
                  <small className="text-muted">Completed bookings</small>
                </div>
                
                {pastBookings.map(booking => (
                  <div key={booking.id} className="booking-card card mb-3 bg-light">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <img 
                            src={booking.spaceImage} 
                            alt={booking.spaceName}
                            className="img-fluid rounded opacity-75"
                            style={{height: '60px', width: '100%', objectFit: 'cover'}}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/200x60/6c757d/ffffff?text=${encodeURIComponent(booking.spaceName)}`;
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <h6 className="card-title text-muted mb-1">{booking.spaceName}</h6>
                          <div className="booking-details small">
                            <span className="me-3">
                              <FaCalendar className="me-1" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            <span className="me-3">
                              <FaClock className="me-1" />
                              {booking.startTime} - {booking.endTime}
                            </span>
                            <span>
                              <FaUsers className="me-1" />
                              {booking.guests}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <span className="badge bg-secondary">
                            COMPLETED
                          </span>
                        </div>
                        <div className="col-md-2 text-end">
                          <Link 
                            to={`/space/${booking.spaceId}`} 
                            className="btn btn-outline-secondary btn-sm"
                          >
                            Book Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions mt-5 pt-4 border-top">
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <Link to="/" className="btn btn-outline-primary btn-lg w-100">
                Explore More Spaces
              </Link>
            </div>
            <div className="col-md-4 mb-3">
              <button 
                className="btn btn-outline-info btn-lg w-100"
                onClick={() => window.location.reload()}
              >
                Refresh Bookings
              </button>
            </div>
            <div className="col-md-4 mb-3">
              <Link to="/" className="btn btn-outline-secondary btn-lg w-100">
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <ConfirmationModal
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCancel}
          booking={selectedBooking}
        />
      </div>
    </div>
  );
};

export default Dashboard;