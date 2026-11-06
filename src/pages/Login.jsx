import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaPhone, FaGoogle, FaFire, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Handle Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  // Send Phone OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number with country code (e.g., +919876543210)');
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    setLoading(true);
    try {
      const confirmation = await sendPhoneOtp(formattedPhone);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error) {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, otpCode);
      navigate(from, { replace: true });
    } catch (error) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md gaming-card rounded-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Glow bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black/60 border border-primary/50 shadow-[0_0_20px_rgba(255,45,45,0.4)] mb-3">
            <FaFire className="text-primary text-3xl" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
            WARRIOR LOGIN
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Access Free Fire Tournaments & Rewards
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-black/60 p-1 rounded-xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-lg transition-all ${
              authMethod === 'email'
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,45,45,0.5)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EMAIL & PASSWORD
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-lg transition-all ${
              authMethod === 'phone'
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,45,45,0.5)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            PHONE OTP
          </button>
        </div>

        {/* Email Login Form */}
        {authMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@ffesports.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors focus:ring-1 focus:ring-primary font-rajdhani text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors focus:ring-1 focus:ring-primary font-rajdhani text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red mt-2"
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER THE ARENA'}
            </button>
          </form>
        ) : (
          /* Phone OTP Form */
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
                    Mobile Number (with +91)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FaPhone />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors font-rajdhani text-base"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red"
                >
                  {loading ? 'SENDING OTP...' : 'REQUEST OTP CODE'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-400">
                    OTP sent to <span className="text-white font-mono">{phoneNumber}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-primary underline mt-1"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-[0.5em] py-3 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-xl font-bold font-mono text-accent focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY & ENTER'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#0f0f0f] text-[11px] font-mono uppercase text-gray-400">
            OR INSTANT ACCESS
          </span>
        </div>

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-heading font-semibold text-xs uppercase tracking-wider transition-all"
        >
          <FaGoogle className="text-red-500 text-sm" />
          <span>Continue with Google</span>
        </button>

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
          <div>
            Don't have an arena account?{' '}
            <Link to="/signup" className="text-primary hover:text-orange-400 font-bold ml-1">
              Sign Up Now (₹50 Free Bonus)
            </Link>
          </div>
          <div>
            Tournament Organizer?{' '}
            <Link to="/admin/login" className="text-accent hover:underline">
              Admin Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
