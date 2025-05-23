import { useEffect, useState } from "react"

const CountDownDate: React.FC<{ endDate: Date }> = ({ endDate }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const timeDifference = endDate.getTime() - now.getTime();

      const calculatedDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const calculatedHours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const calculatedMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const calculatedSeconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setDays(calculatedDays);
      setHours(calculatedHours);
      setMinutes(calculatedMinutes);
      setSeconds(calculatedSeconds);
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{days}</span>
        <span className="text-sm">Jours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{hours}</span>
        <span className="text-sm">Heures</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{minutes}</span>
        <span className="text-sm">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{seconds}</span>
        <span className="text-sm">Secondes</span>
      </div>
    </div>
  );
};

export default CountDownDate;