import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaCalendar, FaClock, FaUsers, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserBookings, cancelBooking } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Use email instead of ID for persistent bookings
  const userBookings = getUserBookings(user?.email);

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
  const sortedBookings = userBookings.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate} ${a.startTime}`);
    const dateB = new Date(`${b.bookingDate} ${b.startTime}`);
    return dateA - dateB;
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="welcome-section text-center mb-5 py-4 bg-light rounded">
          <h1 className="display-6">Welcome back, {user?.name}!</h1>
          <p className="lead text-muted">Here are your upcoming bookings</p>
        </div>

        {sortedBookings.length === 0 ? (
          <div className="no-bookings text-center py-5">
            <FaExclamationTriangle size={64} className="text-muted mb-3" />
            <h3>No bookings yet</h3>
            <p className="text-muted">Start exploring study spaces and make your first booking!</p>
            <a href="/" className="btn btn-primary">Explore Spaces</a>
          </div>
        ) : (
          <div className="bookings-list">
            <h4 className="mb-4">Your Bookings ({sortedBookings.length})</h4>
            {sortedBookings.map(booking => {
              const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
              const isPast = bookingDateTime < new Date();
              
              return (
                <div key={booking.id} className={`booking-card card mb-4 shadow-sm ${isPast ? 'bg-light' : ''}`}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h5 className="card-title text-primary">{booking.spaceName}</h5>
                        <div className="booking-details">
                          <p className="mb-1">
                            <FaCalendar className="me-2 text-muted" />
                            <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                          <p className="mb-1">
                            <FaClock className="me-2 text-muted" />
                            <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                          </p>
                          <p className="mb-1">
                            <FaUsers className="me-2 text-muted" />
                            <strong>Guests:</strong> {booking.guests}
                          </p>
                          {booking.totalPrice && (
                            <p className="mb-0">
                              <strong>Total:</strong> ₱{booking.totalPrice}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 text-center">
                        <span className={`badge ${
                          isPast 
                            ? 'bg-secondary' 
                            : booking.status === 'confirmed' 
                              ? 'bg-success' 
                              : 'bg-secondary'
                        }`}>
                          {isPast ? 'COMPLETED' : booking.status.toUpperCase()}
                        </span>
                        {isPast && <div><small className="text-muted">Past booking</small></div>}
                      </div>
                      <div className="col-md-2 text-end">
                        {!isPast && (
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelClick(booking)}
                          >
                            <FaTimes className="me-1" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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