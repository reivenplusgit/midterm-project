import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ show, onClose, onConfirm, booking }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Cancel Booking</h5>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to cancel your booking at <strong>{booking?.spaceName}</strong>?</p>
          <p>This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Keep Booking
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;