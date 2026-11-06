import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ADMIN_PIN = '9966';

const AdminLogin = () => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputs = useRef([]);
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return; // only digits
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);
    // Auto-focus next
    if (val && idx < 3) inputs.current[idx + 1].focus();
    // Auto-submit when all 4 filled
    if (val && idx === 3) {
      const fullPin = [...newPin].join('');
      if (fullPin.length === 4) submitPin(fullPin);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputs.current[idx - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(text)) {
      const newPin = text.split('');
      setPin(newPin);
      inputs.current[3].focus();
      submitPin(text);
    }
  };

  const submitPin = async (fullPin) => {
    if (fullPin !== ADMIN_PIN) {
      setShake(true);
      setPin(['', '', '', '']);
      inputs.current[0].focus();
      toast.error('❌ Wrong PIN! Access Denied.');
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    await loginWithEmail('7814249224@ffesports.com', 'cheema');
    setLoading(false);
    navigate('/admin');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPin(pin.join(''));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #050505 70%)' }}>

      <div className={`w-full max-w-sm rounded-2xl p-8 border border-red-900/40 relative overflow-hidden
        ${shake ? 'animate-shake' : ''}`}
        style={{ background: '#0d0d0d', boxShadow: '0 0 40px rgba(255,45,45,0.15)' }}>

        {/* Top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-orange-500" />

        {/* Shield icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #ff2d2d22, #ff6a0022)', border: '1px solid #ff2d2d55',
              boxShadow: '0 0 30px rgba(255,45,45,0.3)' }}>
            <FaShieldAlt className="text-4xl" style={{ color: '#ff2d2d' }} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </div>
          <h2 className="font-black text-2xl text-white tracking-widest uppercase"
            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255,45,45,0.5)' }}>
            ADMIN ACCESS
          </h2>
          <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: '#ff2d2d99' }}>
            Enter 4-Digit Security PIN
          </p>
        </div>

        {/* Lock icon row */}
        <div className="flex justify-center mb-6">
          <FaLock className="text-red-700 text-sm" />
        </div>

        {/* PIN inputs */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 mb-8" onPaste={handlePaste}>
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputs.current[idx] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className="w-14 h-16 text-center text-2xl font-black rounded-xl outline-none transition-all duration-200"
                style={{
                  background: '#0a0a0a',
                  border: digit ? '2px solid #ff2d2d' : '2px solid #2a2a2a',
                  color: '#fff',
                  fontFamily: 'Orbitron, sans-serif',
                  boxShadow: digit ? '0 0 15px rgba(255,45,45,0.4)' : 'none',
                  caretColor: '#ff2d2d'
                }}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || pin.join('').length < 4}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              background: 'linear-gradient(90deg, #ff2d2d, #ff6a00)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(255,45,45,0.4)',
              letterSpacing: '3px'
            }}>
            {loading ? '⏳ VERIFYING...' : '🔓 ENTER COMMAND CENTER'}
          </button>
        </form>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {pin.map((digit, idx) => (
            <div key={idx} className="w-2 h-2 rounded-full transition-all duration-200"
              style={{ background: digit ? '#ff2d2d' : '#2a2a2a',
                boxShadow: digit ? '0 0 8px #ff2d2d' : 'none' }} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs tracking-wider uppercase hover:text-white transition-colors"
            style={{ color: '#555', fontFamily: 'Orbitron, sans-serif' }}>
            ← Return to Arena
          </Link>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-8px)}
          80%{transform:translateX(8px)}
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default AdminLogin;
