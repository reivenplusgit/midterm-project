import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useLocalStorage('studyspot_bookings', []);

  const addBooking = (booking) => {
    const newBooking = {
      id: Date.now(),
      ...booking,
      createdAt: new Date().toISOString(),
      userEmail: booking.userEmail // Store user email for persistence
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const getUserBookings = (userEmail) => {
    // Use email instead of ID for persistence across sessions
    return bookings.filter(booking => booking.userEmail === userEmail);
  };

  // Check if a booking conflicts with existing bookings
  const isBookingConflict = (spaceId, bookingDate, startTime, endTime, userEmail) => {
    const existingBookings = bookings.filter(booking => 
      booking.spaceId === spaceId && 
      booking.bookingDate === bookingDate &&
      booking.status === 'confirmed'
    );

    return existingBookings.some(booking => {
      const existingStart = booking.startTime;
      const existingEnd = booking.endTime;
      
      // Check for time overlap
      return (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      );
    });
  };

  // Check if user has already booked the same time slot
  const hasUserBookedSameSlot = (spaceId, bookingDate, startTime, endTime, userEmail) => {
    return bookings.some(booking => 
      booking.spaceId === spaceId &&
      booking.bookingDate === bookingDate &&
      booking.startTime === startTime &&
      booking.endTime === endTime &&
      booking.userEmail === userEmail &&
      booking.status === 'confirmed'
    );
  };

  const value = {
    bookings,
    addBooking,
    cancelBooking,
    getUserBookings,
    isBookingConflict,
    hasUserBookedSameSlot
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};