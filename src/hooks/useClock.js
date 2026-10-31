import { formatClock } from '@/utils/formattingUtils';
import { useEffect, useState } from 'react';

export const useClock = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
    const interval = setInterval(() => {
      // Philippine time, even if the computer is set to another time zone
      setCurrentDateTime(formatClock(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return currentDateTime;
}