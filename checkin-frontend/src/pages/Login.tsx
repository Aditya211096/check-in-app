import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP / Sign Up
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract query tenantId
  const searchParams = new URLSearchParams(window.location.search);
  const tenantId = searchParams.get('tenantId') || '';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return setError('Please enter a phone number');
    
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) return setError('Please enter the OTP');

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otpToken,
          fullName: isNewUser ? fullName : undefined,
          tenantId: tenantId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isNewUser) {
          setIsNewUser(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="app-screen-frame justify-end">
        {/* High Fidelity Geometric Sunrise Landscape Background */}
        <div className="sunrise-landscape">
          <div className="landscape-band band-sky">
            <div className="vector-temple-small"></div>
            <div className="vector-temple"></div>
          </div>
          <div className="landscape-band band-gold"></div>
          <div className="landscape-band band-saffron"></div>
          <div className="landscape-band band-teal">
            <div className="vector-boat-river"></div>
          </div>
          <div className="landscape-band band-clay"></div>
        </div>

        {/* Inputs card overlaying the bottom half of the geometric sunrise */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className="premium-card m-4 relative z-10"
        >
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div className="premium-input-container">
                <label className="premium-input-label">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-secondary">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number" 
                    value={phoneNumber.replace('+91', '')}
                    onChange={(e) => setPhoneNumber(`+91${e.target.value}`)}
                    className="premium-input pl-12"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <span className="text-xs font-semibold text-primary">{error}</span>}

              <button 
                type="submit" 
                className="premium-btn premium-btn-primary w-full mt-2"
                disabled={loading}
              >
                <Smartphone size={18} />
                {loading ? 'Sending Request...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              {isNewUser && (
                <div className="premium-input-container">
                  <label className="premium-input-label">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="premium-input"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="premium-input-container">
                <label className="premium-input-label">Verify OTP</label>
                <input 
                  type="text" 
                  placeholder="Enter OTP (Use 123456)" 
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="premium-input text-center tracking-widest font-bold"
                  disabled={loading}
                />
              </div>

              {error && <span className="text-xs font-semibold text-primary">{error}</span>}

              <button 
                type="submit" 
                className="premium-btn premium-btn-primary w-full mt-2"
                disabled={loading}
              >
                <ShieldCheck size={18} />
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
