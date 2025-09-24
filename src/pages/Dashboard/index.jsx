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

  const userBookings = getUserBookings(user?.id);

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

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="welcome-section text-center mb-5 py-4 bg-light rounded">
          <h1 className="display-6">Welcome back, {user?.name}!</h1>
          <p className="lead text-muted">Here are your upcoming bookings</p>
        </div>

        {userBookings.length === 0 ? (
          <div className="no-bookings text-center py-5">
            <FaExclamationTriangle size={64} className="text-muted mb-3" />
            <h3>No bookings yet</h3>
            <p className="text-muted">Start exploring study spaces and make your first booking!</p>
          </div>
        ) : (
          <div className="bookings-list">
            <h4 className="mb-4">Your Bookings ({userBookings.length})</h4>
            {userBookings.map(booking => (
              <div key={booking.id} className="booking-card card mb-4 shadow-sm">
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
                      <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-md-2 text-end">
                      <button 
                        className="btn btn-outline-danger btn-sm"
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