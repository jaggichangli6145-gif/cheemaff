import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGamepad, FaFire, FaGift, FaCamera } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import toast from 'react-hot-toast';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=camo_fire',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ninja_blade',
  'https://api.dicebear.com/7.x/bottts/svg?seed=cyborg_alpha',
  'https://api.dicebear.com/7.x/bottts/svg?seed=reaper_ff',
  'https://api.dicebear.com/7.x/bottts/svg?seed=phoenix_warrior',
  'https://api.dicebear.com/7.x/bottts/svg?seed=shadow_striker'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    freeFireUid: '',
    password: '',
    confirmPassword: '',
    avatar: AVATAR_OPTIONS[0]
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleCustomAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, avatar: downloadUrl }));
      toast.success('Custom avatar uploaded!');
    } catch (err) {
      console.warn('Storage upload error, using local data URL:', err);
      // Fallback to data URL for seamless preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(file);
      toast.success('Avatar image ready!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (!formData.freeFireUid) {
      toast.error('Please enter your Free Fire In-Game UID.');
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(formData.email, formData.password, {
        username: formData.username,
        phone: formData.phone,
        freeFireUid: formData.freeFireUid,
        avatar: formData.avatar
      });
      navigate('/');
    } catch (error) {
      // toast shown in context
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
        className="w-full max-w-lg gaming-card rounded-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        {/* Welcome Bonus Callout */}
        <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-primary/40 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/30 text-accent text-lg">
            <FaGift className="animate-bounce" />
          </div>
          <div>
            <h4 className="font-heading font-black text-xs text-white uppercase tracking-wider">
              NEW RECRUIT BONUS: ₹50 FREE CREDITS
            </h4>
            <p className="text-[11px] text-gray-300">
              Sign up today and get ₹50 tournament credits added directly to your wallet!
            </p>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black/60 border border-primary/50 shadow-[0_0_15px_rgba(255,45,45,0.4)] mb-2">
            <FaFire className="text-primary text-2xl" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
            JOIN THE ARENA
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
            Create your Free Fire Esports Profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-2">
              Select Combat Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {AVATAR_OPTIONS.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAvatarSelect(imgUrl)}
                  className={`w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all p-1 bg-black/60 ${
                    formData.avatar === imgUrl
                      ? 'border-primary shadow-[0_0_12px_#ff2d2d] scale-105'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
                </button>
              ))}

              <label className="w-12 h-12 flex-shrink-0 rounded-xl border-2 border-dashed border-primary/50 hover:border-primary flex flex-col items-center justify-center cursor-pointer bg-black/40 text-gray-400 hover:text-white transition-all">
                <FaCamera className="text-xs" />
                <span className="text-[8px] uppercase font-mono mt-0.5">Custom</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields: Grid 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Gamer Tag / Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="text-xs" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. SNIPER_BOSS"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Free Fire UID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaGamepad className="text-xs" />
                </div>
                <input
                  type="text"
                  name="freeFireUid"
                  value={formData.freeFireUid}
                  onChange={handleChange}
                  placeholder="e.g. 192837461"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="text-xs" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="pro@ffesports.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaPhone className="text-xs" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+919876543210"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="text-xs" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="text-xs" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingAvatar}
            className="w-full py-3 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red mt-4"
          >
            {loading ? 'REGISTERING ACCOUNT...' : 'CLAIM ₹50 & REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:text-orange-400 font-bold ml-1">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
