export const parseOperatingHours = (hours) => {
  if (hours === '24/7' || hours === 'Open 24/7') {
    return { start: '00:00', end: '23:59', display: '24/7' };
  }
  
  // Handle different formats like "6:00 AM - 12:00 AM"
  const match = hours.match(/(\d+):?(\d*)\s*(AM|PM)?\s*-\s*(\d+):?(\d*)\s*(AM|PM)?/i);
  if (match) {
    let startHour = parseInt(match[1]);
    const startMin = match[2] ? parseInt(match[2]) : 0;
    const startPeriod = match[3]?.toUpperCase();
    let endHour = parseInt(match[4]);
    const endMin = match[5] ? parseInt(match[5]) : 0;
    const endPeriod = match[6]?.toUpperCase();
    
    // Convert to 24-hour format
    if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour = 0;
    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;
    
    // Fix midnight issue - 12:00 AM should be 00:00, but if it's the end time, it should be 24:00 (midnight of next day)
    if (endHour === 0 && endPeriod === 'AM') {
      endHour = 24; // Represent midnight of next day as 24:00
    }
    
    const start = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    const end = endHour === 24 ? '23:59' : `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    // Create proper display format
    const formatTime = (hour, min, period) => {
      const displayHour = period === 'AM' && hour === 12 ? 12 : 
                         period === 'PM' && hour !== 12 ? hour : hour;
      return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
    };
    
    const startDisplay = formatTime(parseInt(match[1]), startMin, startPeriod || 'AM');
    const endDisplay = endHour === 24 ? '12:00 AM (Midnight)' : 
                      formatTime(parseInt(match[4]), endMin, endPeriod || 'PM');
    
    return {
      start,
      end,
      display: `${startDisplay} - ${endDisplay}`
    };
  }
  
  // Default fallback
  return { start: '09:00', end: '21:00', display: '9:00 AM - 9:00 PM' };
};

export const isTimeWithinOperatingHours = (time, operatingHours) => {
  const parsed = parseOperatingHours(operatingHours);
  
  if (parsed.display === '24/7') {
    return true;
  }
  
  // Handle times that cross midnight
  if (parsed.start > parsed.end) {
    // Operating hours cross midnight (e.g., 10:00 PM - 6:00 AM)
    return time >= parsed.start || time <= parsed.end;
  }
  
  return time >= parsed.start && time <= parsed.end;
};

export const formatOperatingHoursForDisplay = (hours) => {
  const parsed = parseOperatingHours(hours);
  return parsed.display;
};