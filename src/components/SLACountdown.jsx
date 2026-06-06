import { useState, useEffect, useRef } from 'react';
import { playBeep } from '../utils/audio';

export default function SLACountdown({ deadline, status }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isBreached, setIsBreached] = useState(false);
    const [isNearDeadline, setIsNearDeadline] = useState(false);
    const [isLessTwoHours, setIsLessTwoHours] = useState(false);
    
    
    const warnedNearDeadlineRef = useRef(false);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!deadline || status === 'Resolved' || status === 'Rejected') return;

        const targetDate = new Date(deadline).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference < 0) {
                setIsBreached(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

      
            setIsBreached(false);
            
            const currentIsNearDeadline = difference <= 30 * 1000;
            setIsNearDeadline(currentIsNearDeadline);
            setIsLessTwoHours(difference <= 2 * 60 * 60 * 1000);

         
            if (currentIsNearDeadline && !warnedNearDeadlineRef.current) {
                warnedNearDeadlineRef.current = true;
         
                if (initializedRef.current) {
                    playBeep();
                }
            }
            initializedRef.current = true;

            setTimeLeft({
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

    
        updateTimer();
        
     
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [deadline, status]);

    if (!deadline || status === 'Resolved' || status === 'Rejected') {
        return <span className="text-slate-400 text-xs italic">-</span>;
    }

    const formatTime = (value) => value.toString().padStart(2, '0');

   
    let colorClass = 'text-green-600 dark:text-green-400';
    let containerClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';

    if (isBreached) {
        colorClass = 'text-red-700 dark:text-red-400 font-bold';
        containerClass = 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800';
    } else if (isNearDeadline) {
      
        colorClass = 'text-red-600 dark:text-red-400 font-bold animate-pulse';
        containerClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    } else if (isLessTwoHours) {
       
        colorClass = 'text-orange-600 dark:text-orange-400 font-semibold';
        containerClass = 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    }

    return (
        <div className={`inline-flex items-center justify-center px-2 py-1 rounded border overflow-hidden ${containerClass}`}>
            <span className={`font-mono text-xs tracking-wider ${colorClass}`}>
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
        </div>
    );
}
