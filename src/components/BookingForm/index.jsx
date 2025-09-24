import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import { bookingSchema, validateTimes } from '../../utils/validationSchemas';
import { FaCalendar, FaClock, FaUsers, FaCheck } from 'react-icons/fa';
import './BookingForm.css';

const BookingForm = ({ spaceId, spaceName, price, timeSlots }) => {
  const { user, isAuthenticated } = useAuth();
  const { addBooking } = useBooking();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setError, setValue } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      guests: 1,
      startTime: '09:00',
      endTime: '10:00'
    }
  });

  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');
  const watchGuests = watch('guests');

  // Parse time slot and set form values
  const handleTimeSlotClick = (slot) => {
    // Handle different time slot formats
    let startTime, endTime;
    
    if (slot.includes(' - ')) {
      // Format: "09:00 - 11:00"
      [startTime, endTime] = slot.split(' - ');
    } else if (slot.includes('-')) {
      // Format: "09:00-11:00"
      [startTime, endTime] = slot.split('-');
    } else if (slot.includes(' to ')) {
      // Format: "9:00 AM to 11:00 AM"
      const [start, end] = slot.split(' to ');
      startTime = convertTo24Hour(start.trim());
      endTime = convertTo24Hour(end.trim());
    } else {
      // Single time format, assume 1 hour duration
      startTime = slot.trim();
      const startHour = parseInt(startTime.split(':')[0]);
      endTime = `${(startHour + 1).toString().padStart(2, '0')}:${startTime.split(':')[1]}`;
    }
    
    // Clean up times and ensure proper format
    startTime = formatTime(startTime);
    endTime = formatTime(endTime);
    
    setValue('startTime', startTime);
    setValue('endTime', endTime);
  };

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM' && hours !== '00') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
  };

  // Ensure time is in HH:MM format
  const formatTime = (time) => {
    const cleaned = time.replace(/\s/g, '');
    if (cleaned.includes(':')) {
      const [hours, minutes] = cleaned.split(':');
      return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
    }
    // If just hours provided
    return `${cleaned.padStart(2, '0')}:00`;
  };

  // Calculate total price
  const calculateTotal = () => {
    if (watchStartTime && watchEndTime) {
      const start = parseInt(watchStartTime.split(':')[0]);
      const end = parseInt(watchEndTime.split(':')[0]);
      const hours = Math.max(end - start, 1); // Ensure at least 1 hour
      return hours * price * (watchGuests || 1);
    }
    return price; // Default to 1 hour, 1 guest
  };

  const onSubmit = (data) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Validate times
    if (!validateTimes(data.startTime, data.endTime)) {
      setError('endTime', {
        type: 'manual',
        message: 'End time must be after start time'
      });
      return;
    }

    const booking = {
      spaceId,
      spaceName,
      userId: user.id,
      userName: user.name,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      guests: parseInt(data.guests),
      totalPrice: calculateTotal(),
      status: 'confirmed'
    };

    addBooking(booking);
    alert('Booking confirmed! Check your dashboard.');
    navigate('/dashboard/my-bookings');
  };

  if (!isAuthenticated) {
    return (
      <div className="booking-form-container">
        <div className="alert alert-info">
          <h6>Please log in to make a booking</h6>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0"><FaCalendar className="me-2" />Book This Space</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">
                <FaCalendar className="me-2" /> Booking Date
              </label>
              <input
                type="date"
                className={`form-control ${errors.bookingDate ? 'is-invalid' : ''}`}
                {...register('bookingDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.bookingDate && (
                <div className="invalid-feedback">{errors.bookingDate.message}</div>
              )}
            </div>
            
            {/* Predefined Time Slots */}
            {timeSlots && timeSlots.length > 0 && (
              <div className="mb-3">
                <label className="form-label">
                  <FaClock className="me-2" /> Quick Select Time Slots
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleTimeSlotClick(slot)}
                      title={`Click to select ${slot}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <small className="text-muted">Click a time slot to automatically fill start and end times</small>
              </div>
            )}
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  <FaClock className="me-2" /> Start Time
                </label>
                <input
                  type="time"
                  className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                  {...register('startTime')}
                />
                {errors.startTime && (
                  <div className="invalid-feedback">{errors.startTime.message}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  <FaClock className="me-2" /> End Time
                </label>
                <input
                  type="time"
                  className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                  {...register('endTime')}
                />
                {errors.endTime && (
                  <div className="invalid-feedback">
                    {errors.endTime.message || (errors.endTime?.type === 'manual' && 'End time must be after start time')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">
                <FaUsers className="me-2" /> Number of Guests
              </label>
              <input
                type="number"
                className={`form-control ${errors.guests ? 'is-invalid' : ''}`}
                {...register('guests')}
                min="1"
                max="10"
              />
              {errors.guests && (
                <div className="invalid-feedback">{errors.guests.message}</div>
              )}
            </div>
            
            <div className="price-summary mb-3 p-3 bg-light rounded">
              <h6>Price Summary</h6>
              <div className="d-flex justify-content-between">
                <span>₱{price} × {watchGuests || 1} guests</span>
                <span>₱{calculateTotal()}</span>
              </div>
            </div>
            
            <button type="submit" className="btn btn-success w-100">
              <FaCheck className="me-2" /> Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;