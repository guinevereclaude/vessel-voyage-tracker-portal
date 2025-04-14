
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const Clock = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-maritime-700 dark:text-maritime-300 text-sm">
      <time dateTime={date.toISOString()}>
        {format(date, 'MMMM d, yyyy')} - {format(date, 'h:mm:ss a')}
      </time>
    </div>
  );
};

export default Clock;
