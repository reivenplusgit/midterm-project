import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import { bookingSchema, validateTimes } from '../../utils/validationSchemas';
import { FaCalendar, FaClock, FaUsers, FaCheck, FaBolt, FaExclamationTriangle } from 'react-icons/fa';
import './BookingForm.css';

const BookingForm = ({ spaceId, spaceName, price, timeSlots, operatingHours }) => {
  const { user, isAuthenticated } = useAuth();
  const { addBooking, isBookingConflict, hasUserBookedSameSlot } = useBooking();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, setError, clearErrors } = useForm({
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
  const watchBookingDate = watch('bookingDate');

  // Parse operating hours
  const parseOperatingHours = (hours) => {
    if (hours === 'Open 24/7' || hours === '24/7') {
      return { start: '00:00', end: '23:59' };
    }
    
    const match = hours.match(/(\d+):?(\d*)\s*(AM|PM)?\s*-\s*(\d+):?(\d*)\s*(AM|PM)?/i);
    if (match) {
      let startHour = parseInt(match[1]);
      const startMin = match[2] ? parseInt(match[2]) : 0;
      const startPeriod = match[3]?.toUpperCase();
      let endHour = parseInt(match[4]);
      const endMin = match[5] ? parseInt(match[5]) : 0;
      const endPeriod = match[6]?.toUpperCase();
      
      if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
      if (startPeriod === 'AM' && startHour === 12) startHour = 0;
      if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (endPeriod === 'AM' && endHour === 12) endHour = 0;
      
      return {
        start: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        end: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
      };
    }
    
    return { start: '09:00', end: '21:00' };
  };

  const operatingHoursParsed = parseOperatingHours(operatingHours || '9:00 AM - 9:00 PM');

  // Validate time against operating hours
  const isTimeWithinOperatingHours = (time) => {
    return time >= operatingHoursParsed.start && time <= operatingHoursParsed.end;
  };

  // Parse time slot function
  const parseTimeSlot = (slot) => {
    if (slot.includes('Full Day Pass')) {
      return { startTime: operatingHoursParsed.start, endTime: operatingHoursParsed.end };
    }
    if (slot.includes('Night Owl Pass')) {
      return { startTime: '21:00', endTime: '06:00' };
    }
    
    const timeMatch = slot.match(/(\d+)(am|pm)\s*-\s*(\d+)(am|pm)/i);
    if (timeMatch) {
      const startHour = parseInt(timeMatch[1]);
      const startPeriod = timeMatch[2].toLowerCase();
      const endHour = parseInt(timeMatch[3]);
      const endPeriod = timeMatch[4].toLowerCase();
      
      const formatTime = (hour, period) => {
        let militaryHour = hour;
        if (period === 'pm' && hour !== 12) militaryHour += 12;
        if (period === 'am' && hour === 12) militaryHour = 0;
        return militaryHour.toString().padStart(2, '0') + ':00';
      };
      
      return {
        startTime: formatTime(startHour, startPeriod),
        endTime: formatTime(endHour, endPeriod)
      };
    }
    
    if (slot.includes('Morning Session')) {
      return { startTime: '10:00', endTime: '14:00' };
    }
    if (slot.includes('Afternoon Session')) {
      return { startTime: '14:00', endTime: '18:00' };
    }
    if (slot.includes('Evening')) {
      return { startTime: '18:00', endTime: '22:00' };
    }
    if (slot.includes('Early Bird')) {
      return { startTime: '06:00', endTime: '12:00' };
    }
    
    return { startTime: operatingHoursParsed.start, endTime: '10:00' };
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    const times = parseTimeSlot(slot);
    setValue('startTime', times.startTime);
    setValue('endTime', times.endTime);
    clearErrors('startTime');
    clearErrors('endTime');
  };

  const calculateTotal = () => {
    if (watchStartTime && watchEndTime) {
      const start = parseInt(watchStartTime.split(':')[0]);
      const end = parseInt(watchEndTime.split(':')[0]);
      let hours = end - start;
      
      if (hours < 0) hours += 24;
      hours = Math.max(hours, 1);
      return hours * price * (watchGuests || 1);
    }
    return price;
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

    // Validate against operating hours
    if (!isTimeWithinOperatingHours(data.startTime)) {
      setError('startTime', {
        type: 'manual',
        message: `Start time must be within operating hours (${operatingHours})`
      });
      return;
    }

    if (!isTimeWithinOperatingHours(data.endTime)) {
      setError('endTime', {
        type: 'manual',
        message: `End time must be within operating hours (${operatingHours})`
      });
      return;
    }

    // Check if user already booked the same slot
    if (hasUserBookedSameSlot(spaceId, data.bookingDate, data.startTime, data.endTime, user.email)) {
      alert('You have already booked this exact time slot. Please choose a different time.');
      return;
    }

    // Check for booking conflicts
    if (isBookingConflict(spaceId, data.bookingDate, data.startTime, data.endTime, user.email)) {
      alert('This time slot is already booked. Please choose a different time.');
      return;
    }

    const booking = {
      spaceId,
      spaceName,
      userId: user.id,
      userName: user.name,
      userEmail: user.email, // Add email for persistence
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      guests: parseInt(data.guests),
      totalPrice: calculateTotal(),
      timeSlot: selectedTimeSlot,
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
          {/* Operating Hours Notice */}
          <div className="alert alert-info mb-3">
            <FaClock className="me-2" />
            <strong>Operating Hours:</strong> {operatingHours}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Quick Time Slots */}
            {timeSlots && timeSlots.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-bold">
                  <FaBolt className="me-2 text-warning" /> Quick Select Time Slots
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn btn-sm ${
                        selectedTimeSlot === slot ? 'btn-success' : 'btn-outline-primary'
                      }`}
                      onClick={() => handleTimeSlotSelect(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <small className="text-muted">Click a time slot to auto-fill the time fields</small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                <FaCalendar className="me-2" /> Booking Date
              </label>
              <input
                type="date"
                className={`form-control booking-input ${errors.bookingDate ? 'is-invalid' : ''}`}
                {...register('bookingDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.bookingDate && (
                <div className="invalid-feedback">{errors.bookingDate.message}</div>
              )}
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  <FaClock className="me-2" /> Start Time
                </label>
                <input
                  type="time"
                  className={`form-control booking-input ${errors.startTime ? 'is-invalid' : ''}`}
                  {...register('startTime')}
                  min={operatingHoursParsed.start}
                  max={operatingHoursParsed.end}
                  onChange={(e) => {
                    setSelectedTimeSlot(null);
                    register('startTime').onChange(e);
                  }}
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
                  className={`form-control booking-input ${errors.endTime ? 'is-invalid' : ''}`}
                  {...register('endTime')}
                  min={operatingHoursParsed.start}
                  max={operatingHoursParsed.end}
                  onChange={(e) => {
                    setSelectedTimeSlot(null);
                    register('endTime').onChange(e);
                  }}
                />
                {errors.endTime && (
                  <div className="invalid-feedback">{errors.endTime.message}</div>
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
            
            {/* Price Summary */}
            <div className="price-summary mb-3 p-3 bg-light rounded">
              <h6 className="fw-bold">Price Summary</h6>
              <div className="d-flex justify-content-between mb-1">
                <span>Hourly Rate:</span>
                <span>₱{price}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Guests:</span>
                <span>{watchGuests || 1}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Duration:</span>
                <span>
                  {watchStartTime && watchEndTime ? (
                    (() => {
                      const start = parseInt(watchStartTime.split(':')[0]);
                      const end = parseInt(watchEndTime.split(':')[0]);
                      let hours = end - start;
                      if (hours < 0) hours += 24;
                      return Math.max(hours, 1) + ' hours';
                    })()
                  ) : '1 hour'}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span className="text-success">₱{calculateTotal()}</span>
              </div>
            </div>
            
            <button type="submit" className="btn btn-success w-100 py-2">
              <FaCheck className="me-2" /> Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;