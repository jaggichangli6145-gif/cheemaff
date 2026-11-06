import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaGamepad, FaCalendarAlt, FaClock, FaTrophy, FaCoins, FaImage, FaShieldAlt } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import toast from 'react-hot-toast';

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
];

const CreateTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    mode: 'Squad',
    type: 'Paid',
    map: 'Bermuda',
    entryFee: 50,
    prizePool: 1500,
    perKillPrize: 20,
    maxPlayers: 48,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '20:00',
    banner: DEFAULT_BANNERS[0],
    matchId: '',
    matchPassword: '',
    rules: `1. Mobile players only (emulators prohibited).
2. Room ID & password will be shared 15 minutes before the match starts.
3. Teaming up or hacking results in an immediate ban and forfeiture of wallet balance.`
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setFormData(prev => ({ ...prev, banner: url }));
      toast.success('Custom banner uploaded!');
    } catch (err) {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, banner: event.target.result }));
      };
      reader.readAsDataURL(file);
      toast.success('Banner preview loaded!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Tournament title is required.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tournaments'), {
        title: formData.title,
        mode: formData.mode,
        type: Number(formData.entryFee) === 0 ? 'Free' : 'Paid',
        map: formData.map,
        entryFee: Number(formData.entryFee),
        prizePool: Number(formData.prizePool),
        perKillPrize: Number(formData.perKillPrize),
        maxPlayers: Number(formData.maxPlayers) || 48,
        currentPlayers: 0,
        date: formData.date,
        time: formData.time,
        status: 'upcoming',
        banner: formData.banner,
        matchId: formData.matchId || '',
        matchPassword: formData.matchPassword || '',
        rules: formData.rules,
        createdAt: serverTimestamp()
      });

      toast.success('Tournament created and live in arena!');
      navigate('/admin/tournaments');
    } catch (err) {
      console.error('Error creating tournament:', err);
      toast.error('Failed to create tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaPlusCircle className="text-primary text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
              CREATE NEW TOURNAMENT
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Publish Free Fire Custom Room & Set Prize Pool
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="gaming-card p-6 sm:p-8 rounded-2xl border border-primary/30 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
            Tournament Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. BERMUDA GRAND MASTERS - SQUAD BATTLE"
            required
            className="w-full px-4 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-base text-white focus:outline-none"
          />
        </div>

        {/* Mode, Map, Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Battle Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Map Arena
            </label>
            <select
              name="map"
              value={formData.map}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="Bermuda">Bermuda</option>
              <option value="Purgatory">Purgatory</option>
              <option value="Kalahari">Kalahari</option>
              <option value="Alpine">Alpine</option>
              <option value="NeXTerra">NeXTerra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
            >
              <option value="Paid">Paid Tournament</option>
              <option value="Free">Free Entry</option>
            </select>
          </div>
        </div>

        {/* Financials & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Entry Fee (₹)
            </label>
            <input
              type="number"
              name="entryFee"
              min="0"
              value={formData.entryFee}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Prize Pool (₹)
            </label>
            <input
              type="number"
              name="prizePool"
              min="0"
              value={formData.prizePool}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm font-mono text-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Per Kill Prize (₹)
            </label>
            <input
              type="number"
              name="perKillPrize"
              min="0"
              value={formData.perKillPrize}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm font-mono text-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Max Slots
            </label>
            <input
              type="number"
              name="maxPlayers"
              min="1"
              max="100"
              value={formData.maxPlayers}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Match Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
              Match Time (24h)
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Initial Room Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-black/60 rounded-xl border border-white/10">
          <div>
            <label className="block text-xs font-heading text-accent uppercase mb-1">
              Room ID (Optional now, can add later)
            </label>
            <input
              type="text"
              name="matchId"
              value={formData.matchId}
              onChange={handleChange}
              placeholder="e.g. ROOM-789012"
              className="w-full px-3 py-2 bg-black/90 border border-white/15 focus:border-accent rounded-lg text-sm text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-heading text-accent uppercase mb-1">
              Room Password (Optional now)
            </label>
            <input
              type="text"
              name="matchPassword"
              value={formData.matchPassword}
              onChange={handleChange}
              placeholder="e.g. 123456"
              className="w-full px-3 py-2 bg-black/90 border border-white/15 focus:border-accent rounded-lg text-sm text-white font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Banner Selection */}
        <div>
          <label className="block text-xs font-heading text-gray-300 uppercase mb-2">
            Select Cover Banner
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {DEFAULT_BANNERS.map((bUrl, idx) => (
              <div
                key={idx}
                onClick={() => setFormData(prev => ({ ...prev, banner: bUrl }))}
                className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  formData.banner === bUrl ? 'border-primary shadow-neon-red scale-102' : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={bUrl} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/15 hover:border-primary text-xs font-heading text-gray-300 hover:text-white cursor-pointer">
            <FaImage />
            <span>Upload Custom Cover Banner</span>
            <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-xs font-heading text-gray-300 uppercase mb-1.5">
            Rules & Match Regulations
          </label>
          <textarea
            name="rules"
            rows="4"
            value={formData.rules}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-primary rounded-xl text-xs font-mono text-gray-200 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3.5 rounded-xl font-heading font-bold text-sm btn-primary shadow-neon-red"
        >
          {loading ? 'LAUNCHING TOURNAMENT...' : 'PUBLISH TOURNAMENT TO ARENA'}
        </button>
      </form>
    </div>
  );
};

export default CreateTournament;
