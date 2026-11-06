import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEnvelope, FaLock, FaPhone, FaGoogle, FaFire,
  FaEye, FaEyeSlash, FaShieldAlt, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ADMIN_PIN = '9966';

const Login = () => {
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin PIN modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [shake, setShake] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const pinRefs = useRef([]);

  const { loginWithEmail, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  /* ── Normal Email Login ─────────────────────────────── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password.'); return; }
    setLoading(true);
    try { await loginWithEmail(email, password); navigate(from, { replace: true }); }
    catch {}
    finally { setLoading(false); }
  };

  /* ── Google Login ───────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setLoading(true);
    try { await loginWithGoogle(); navigate(from, { replace: true }); }
    catch {}
    finally { setLoading(false); }
  };

  /* ── Phone OTP ──────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Enter a valid phone number.'); return;
    }
    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    setLoading(true);
    try { const c = await sendPhoneOtp(formatted); setConfirmationResult(c); setOtpSent(true); }
    catch {}
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) { toast.error('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try { await verifyPhoneOtp(confirmationResult, otpCode); navigate(from, { replace: true }); }
    catch {}
    finally { setLoading(false); }
  };

  /* ── Admin PIN modal ────────────────────────────────── */
  const openAdminModal = () => {
    setPin(['', '', '', '']);
    setShake(false);
    setShowAdminModal(true);
    setTimeout(() => pinRefs.current[0]?.focus(), 100);
  };

  const closeAdminModal = () => { setShowAdminModal(false); setPin(['', '', '', '']); };

  const handlePinChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);
    if (val && idx < 3) pinRefs.current[idx + 1]?.focus();
    if (val && idx === 3) submitAdminPin([...newPin].join(''));
  };

  const handlePinKey = (e, idx) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) pinRefs.current[idx - 1]?.focus();
  };

  const submitAdminPin = async (fullPin) => {
    if (fullPin !== ADMIN_PIN) {
      setShake(true);
      setPin(['', '', '', '']);
      setTimeout(() => { setShake(false); pinRefs.current[0]?.focus(); }, 600);
      toast.error('❌ Wrong PIN! Access Denied.');
      return;
    }
    setAdminLoading(true);
    try {
      await loginWithEmail('7814249224@ffesports.com', 'cheema');
      setShowAdminModal(false);
      navigate('/admin');
    } catch {}
    finally { setAdminLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="w-full max-w-md gaming-card rounded-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black/60 border border-primary/50 shadow-[0_0_20px_rgba(255,45,45,0.4)] mb-3">
            <FaFire className="text-primary text-3xl" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">WARRIOR LOGIN</h2>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">Access Free Fire Tournaments & Rewards</p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-black/60 p-1 rounded-xl mb-6 border border-white/10">
          {['email', 'phone'].map(m => (
            <button key={m} type="button" onClick={() => setAuthMethod(m)}
              className={`flex-1 py-2 text-xs font-heading font-bold rounded-lg transition-all ${
                authMethod === m ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,45,45,0.5)]' : 'text-gray-400 hover:text-white'
              }`}>
              {m === 'email' ? 'EMAIL & PASSWORD' : 'PHONE OTP'}
            </button>
          ))}
        </div>

        {/* Email Form */}
        {authMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="warrior@ffesports.com" required
                  className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-10 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red mt-2">
              {loading ? 'AUTHENTICATING...' : 'ENTER THE ARENA'}
            </button>
          </form>
        ) : (
          /* Phone OTP Form */
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400"><FaPhone /></div>
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210" required
                      className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red">
                  {loading ? 'SENDING OTP...' : 'REQUEST OTP CODE'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-400">OTP sent to <span className="text-white font-mono">{phoneNumber}</span></p>
                  <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-primary underline mt-1">Change Number</button>
                </div>
                <div>
                  <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">Enter 6-Digit OTP</label>
                  <input type="text" maxLength={6} value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456" required
                    className="w-full text-center tracking-[0.5em] py-3 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-xl font-bold font-mono text-accent focus:outline-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red">
                  {loading ? 'VERIFYING...' : 'VERIFY & ENTER'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <span className="relative px-3 bg-[#0f0f0f] text-[11px] font-mono uppercase text-gray-400">OR INSTANT ACCESS</span>
        </div>

        {/* Google Login */}
        <button type="button" onClick={handleGoogleLogin} disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-heading font-semibold text-xs uppercase tracking-wider transition-all">
          <FaGoogle className="text-red-500 text-sm" />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-gray-400 space-y-2">
          <div>
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-orange-400 font-bold ml-1">Sign Up (₹50 Free Bonus)</Link>
          </div>
        </div>

        {/* ── ADMIN LOGIN BUTTON ── */}
        <div className="mt-5 pt-4 border-t border-white/10 flex justify-center">
          <button onClick={openAdminModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-widest transition-all"
            style={{
              background: 'linear-gradient(90deg,#1a0000,#2a0000)',
              border: '1px solid #ff2d2d55',
              color: '#ff2d2d',
              boxShadow: '0 0 15px rgba(255,45,45,0.2)'
            }}>
            <FaShieldAlt className="text-sm" />
            Admin Login
          </button>
        </div>
      </motion.div>

      {/* ══════════ ADMIN PIN MODAL ══════════ */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeAdminModal(); }}>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300 }}
              className={`w-full max-w-xs rounded-2xl p-7 relative ${shake ? 'animate-shake' : ''}`}
              style={{ background: '#0d0d0d', border: '1px solid #ff2d2d55', boxShadow: '0 0 50px rgba(255,45,45,0.25)' }}>

              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-red-700 via-red-500 to-orange-500" />

              {/* Close */}
              <button onClick={closeAdminModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
                <FaTimes />
              </button>

              {/* Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg,#ff2d2d22,#ff6a0022)', border: '1px solid #ff2d2d55', boxShadow: '0 0 25px rgba(255,45,45,0.3)' }}>
                  <FaShieldAlt className="text-3xl" style={{ color: '#ff2d2d' }} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <h3 className="font-black text-lg text-white tracking-widest uppercase"
                  style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(255,45,45,0.5)' }}>
                  ADMIN ACCESS
                </h3>
                <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: '#ff2d2d99' }}>
                  Enter 4-Digit PIN
                </p>
              </div>

              {/* PIN boxes */}
              <div className="flex justify-center gap-3 mb-6">
                {pin.map((digit, idx) => (
                  <input key={idx} ref={el => pinRefs.current[idx] = el}
                    type="password" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handlePinChange(e.target.value, idx)}
                    onKeyDown={e => handlePinKey(e, idx)}
                    className="w-13 h-14 text-center text-2xl font-black rounded-xl outline-none transition-all duration-200"
                    style={{
                      width: '52px', height: '58px',
                      background: '#0a0a0a',
                      border: digit ? '2px solid #ff2d2d' : '2px solid #2a2a2a',
                      color: '#fff',
                      fontFamily: 'Orbitron, sans-serif',
                      boxShadow: digit ? '0 0 14px rgba(255,45,45,0.5)' : 'none'
                    }} />
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-2 mb-5">
                {pin.map((d, i) => (
                  <div key={i} className="w-2 h-2 rounded-full transition-all duration-200"
                    style={{ background: d ? '#ff2d2d' : '#2a2a2a', boxShadow: d ? '0 0 8px #ff2d2d' : 'none' }} />
                ))}
              </div>

              {/* Submit */}
              <button onClick={() => submitAdminPin(pin.join(''))}
                disabled={adminLoading || pin.join('').length < 4}
                className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-40 transition-all"
                style={{ fontFamily: 'Orbitron, sans-serif', background: 'linear-gradient(90deg,#ff2d2d,#ff6a00)', color: '#fff', boxShadow: '0 0 18px rgba(255,45,45,0.4)', letterSpacing: '3px' }}>
                {adminLoading ? '⏳ VERIFYING...' : '🔓 UNLOCK PANEL'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default Login;
