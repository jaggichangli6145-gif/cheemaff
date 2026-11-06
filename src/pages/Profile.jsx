import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaGamepad, 
  FaEnvelope, 
  FaPhone, 
  FaTrophy, 
  FaCrosshairs, 
  FaCoins, 
  FaSignOutAlt, 
  FaEdit, 
  FaCamera, 
  FaSave,
  FaShieldAlt
} from 'react-icons/fa';
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

const Profile = () => {
  const { currentUser, userData, logout, updateUserProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    freeFireUid: userData?.freeFireUid || '',
    phone: userData?.phone || '',
    avatar: userData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.uid}`
  });
  const [saving, setSaving] = useState(false);

  const stats = userData?.stats || {
    matches: 12,
    wins: 3,
    kills: 38,
    earnings: userData?.balance || 50
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be below 2MB.');
      return;
    }

    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setFormData(prev => ({ ...prev, avatar: url }));
      toast.success('Avatar uploaded!');
    } catch (err) {
      // Data URL fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(file);
      toast.success('Avatar updated locally!');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        username: formData.username,
        freeFireUid: formData.freeFireUid,
        phone: formData.phone,
        avatar: formData.avatar
      });
      setIsEditing(false);
    } catch (err) {
      // handled
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header Profile Card */}
      <div className="gaming-card p-6 rounded-2xl relative overflow-hidden border border-primary/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar display with edit badge */}
          <div className="relative group">
            <img
              src={formData.avatar}
              alt={userData?.username || 'Player Avatar'}
              className="w-24 h-24 rounded-2xl border-2 border-primary object-cover shadow-[0_0_20px_rgba(255,45,45,0.4)] p-1 bg-black/60"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera size={18} />
                <span className="text-[9px] font-mono mt-1">UPLOAD</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
                {userData?.username || 'Combat Warrior'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider w-max mx-auto sm:mx-0 ${
                isAdmin 
                  ? 'bg-yellow-950 text-accent border border-accent/40' 
                  : 'bg-primary/20 text-primary border border-primary/40'
              }`}>
                {isAdmin ? 'ADMINISTRATOR' : 'ELITE PLAYER'}
              </span>
            </div>

            <p className="text-xs font-mono text-gray-400">
              Free Fire UID: <span className="text-white font-bold">{userData?.freeFireUid || 'Not Linked Yet'}</span>
            </p>
            <p className="text-xs font-mono text-gray-400">
              Email: <span className="text-gray-300">{currentUser?.email}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary text-xs font-heading font-semibold text-gray-300 hover:text-white transition-all"
              >
                <FaEdit />
                <span>{isEditing ? 'CANCEL EDIT' : 'EDIT PROFILE'}</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-accent/40 text-xs font-heading font-semibold text-accent hover:bg-yellow-900/40 transition-all"
                >
                  <FaShieldAlt />
                  <span>ADMIN DASHBOARD</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 hover:border-red-500 text-xs font-heading font-semibold text-red-400 hover:text-red-300 transition-all"
              >
                <FaSignOutAlt />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form (if editing is active) */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="gaming-card p-6 rounded-2xl border border-primary/40 space-y-4">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <FaEdit className="text-primary" />
            UPDATE COMBAT PROFILE
          </h3>

          {/* Quick Avatar selector */}
          <div>
            <label className="block text-xs font-heading text-gray-400 uppercase mb-2">
              Change Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAvatarSelect(url)}
                  className={`w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-black/60 ${
                    formData.avatar === url ? 'border-primary shadow-neon-red' : 'border-white/10'
                  }`}
                >
                  <img src={url} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase mb-1">
                Gamer Tag
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase mb-1">
                Free Fire UID
              </label>
              <input
                type="text"
                value={formData.freeFireUid}
                onChange={(e) => setFormData(prev => ({ ...prev, freeFireUid: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-heading text-gray-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-black/70 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-bold text-xs btn-primary shadow-neon-red"
          >
            <FaSave />
            <span>{saving ? 'SAVING CHANGES...' : 'SAVE PROFILE'}</span>
          </button>
        </form>
      )}

      {/* Lifetime Career Stats Grid */}
      <div>
        <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-3">
          LIFETIME CAREER COMBAT RECORD
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="gaming-card p-4 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">MATCHES PLAYED</span>
            <div className="font-heading font-black text-2xl text-white mt-1 flex items-center justify-center gap-1">
              <FaGamepad className="text-secondary text-base" />
              <span>{stats.matches}</span>
            </div>
          </div>

          <div className="gaming-card p-4 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">VICTORIES / BOOYAH</span>
            <div className="font-heading font-black text-2xl text-accent glow-text-gold mt-1 flex items-center justify-center gap-1">
              <FaTrophy className="text-accent text-base" />
              <span>{stats.wins}</span>
            </div>
          </div>

          <div className="gaming-card p-4 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">TOTAL FRAGS / KILLS</span>
            <div className="font-heading font-black text-2xl text-primary mt-1 flex items-center justify-center gap-1">
              <FaCrosshairs className="text-primary text-base" />
              <span>{stats.kills}</span>
            </div>
          </div>

          <div className="gaming-card p-4 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">TOTAL EARNINGS</span>
            <div className="font-heading font-black text-2xl text-green-400 mt-1 flex items-center justify-center gap-1">
              <FaCoins className="text-green-400 text-base" />
              <span>₹{userData?.balance || 50}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
