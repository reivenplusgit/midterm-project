import * as yup from 'yup';

export const loginSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required')
});

export const bookingSchema = yup.object({
  bookingDate: yup
    .date()
    .required('Booking date is required')
    .min(new Date(), 'Date cannot be in the past'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  guests: yup
    .number()
    .typeError('Number of guests must be a whole number')
    .required('Number of guests is required')
    .min(1, 'At least 1 guest required')
    .max(10, 'Maximum 10 guests allowed')
    .integer('Must be a whole number')
    .test('no-decimal', 'Decimal numbers are not allowed', value => {
      return value === undefined || value === null || Number.isInteger(value);
    })
});

// Add time validation function
export const validateTimes = (startTime, endTime) => {
  if (startTime && endTime) {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return end > start;
  }
  return true;
};