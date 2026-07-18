import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Compass, CheckCircle, AlertTriangle } from 'lucide-react';

interface WaveProgressProps {
  status: 'PENDING' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'BREACHED';
  etaMinutes?: number | null;
  etaSetAt?: string | null;
}

const statusSteps = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];

const stepLabels: Record<string, string> = {
  PENDING: 'Ghat Ticket Raised',
  ACKNOWLEDGED: 'Staff Dispatched',
  IN_PROGRESS: 'Staff On-Site',
  RESOLVED: 'Issue Resolved',
  BREACHED: 'SLA Breached (Escalating)',
};

export const WaveProgress: React.FC<WaveProgressProps> = ({ status, etaMinutes, etaSetAt }) => {
  const currentStepIndex = statusSteps.indexOf(status === 'BREACHED' ? 'PENDING' : status);
  const totalSteps = statusSteps.length;
  
  // Calculate percentage of progress
  const progressPercent = status === 'RESOLVED' 
    ? 100 
    : status === 'BREACHED'
    ? 25
    : Math.min(100, Math.max(10, (currentStepIndex / (totalSteps - 1)) * 100));

  // Compute countdown timer
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (!etaMinutes || !etaSetAt) return;

    const timer = setInterval(() => {
      const setTime = new Date(etaSetAt).getTime();
      const targetTime = setTime + etaMinutes * 60 * 1000;
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        setTimeLeft('ETA Overdue');
        clearInterval(timer);
      } else {
        const mins = Math.floor(difference / (1000 * 60));
        const secs = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${mins}m ${secs}s remaining`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [etaMinutes, etaSetAt]);

  const isBreached = status === 'BREACHED';

  return (
    <div className="w-full mt-4 p-6 kashi-card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-secondary font-bold">
            Live Ticket Status
          </span>
          <h3 className="text-lg font-bold text-dark-navy mt-1">
            {stepLabels[status]}
          </h3>
        </div>
        {etaMinutes && status !== 'RESOLVED' && (
          <div className="text-right">
            <span className="text-xs text-secondary font-medium">Est. Resolution Time</span>
            <p className={`text-sm font-bold ${isBreached ? 'text-primary' : 'text-teal'} mt-1`}>
              {timeLeft || `${etaMinutes} Minutes`}
            </p>
          </div>
        )}
      </div>

      {/* Real-time boat sliding canal track */}
      <div className="relative w-full h-12 bg-white rounded-full border border-border overflow-hidden flex items-center px-4">
        {/* Animated Ganga river waves fill */}
        <motion.div 
          className="absolute top-0 left-0 h-100% bg-opacity-10 h-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${progressPercent}%`,
            backgroundColor: isBreached ? 'rgba(231, 111, 81, 0.12)' : 'rgba(42, 157, 143, 0.12)'
          }}
          transition={{ type: 'spring', stiffness: 40, damping: 12 }}
        />

        {/* Small wood rowboat gliding across waves */}
        <motion.div 
          className="absolute z-10 floating-boat"
          initial={{ left: '0%' }}
          animate={{ left: `calc(${progressPercent}% - 30px)` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          style={{ position: 'absolute' }}
        >
          {/* Custom SVG Wood Boat */}
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 14C8 18 32 18 36 14L40 6H0L4 14Z" fill={isBreached ? '#E76F51' : '#A47551'} />
            <rect x="18" y="1" width="3" height="6" fill="#1C2D37" />
            <path d="M12 7L24 7" stroke="#1C2D37" strokeWidth="1.5" />
          </svg>
        </motion.div>

        {/* Dynamic Water Waves graphics in background */}
        <svg className="absolute bottom-0 left-0 w-full h-4 opacity-30" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M0 10 C 30 18, 70 2, 100 10 L 100 20 L 0 20 Z" fill={isBreached ? '#E76F51' : '#2A9D8F'} />
        </svg>
      </div>

      {/* Progress Steps Indicators */}
      <div className="grid grid-cols-4 mt-6 gap-2 text-center">
        {statusSteps.map((step, idx) => {
          const isDone = currentStepIndex >= idx;
          const isActive = status === step;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  isDone 
                    ? 'bg-teal border-teal text-white' 
                    : 'bg-white border-border text-text-secondary'
                } ${isActive ? 'ring-4 ring-secondary ring-opacity-25' : ''}`}
              >
                {idx === 0 && <Anchor size={14} />}
                {idx === 1 && <Compass size={14} />}
                {idx === 2 && <motion.div animate={isActive ? { rotate: 360 } : {}} transition={isActive ? { repeat: Infinity, duration: 3, ease: 'linear' } : {}}><Compass size={14} /></motion.div>}
                {idx === 3 && <CheckCircle size={14} />}
              </div>
              <span className={`text-[10px] font-bold mt-2 ${isDone ? 'text-teal' : 'text-text-secondary'}`}>
                {step === 'PENDING' ? 'Raised' : step === 'ACKNOWLEDGED' ? 'Dispatched' : step === 'IN_PROGRESS' ? 'On-site' : 'Resolved'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert warning badge if task status is breached */}
      {isBreached && (
        <div className="mt-4 p-3 bg-red-50 border border-primary border-opacity-20 rounded-xl flex items-center gap-3 text-primary text-xs font-medium">
          <AlertTriangle size={16} />
          <span>Management has been alerted. Auto-escalating dispatch delay.</span>
        </div>
      )}
    </div>
  );
};
