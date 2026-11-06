import React, { useState, useEffect } from 'react';
import { 
  FaGamepad, 
  FaKey, 
  FaTrash, 
  FaTrophy, 
  FaEdit, 
  FaCheck, 
  FaCalendarAlt, 
  FaClock, 
  FaTimes,
  FaShareAlt
} from 'react-icons/fa';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal edit credentials state
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [matchStatus, setMatchStatus] = useState('upcoming');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTournaments(list);
      setLoading(false);
    }, (err) => {
      console.warn('Tournaments snapshot note:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openCredentialsModal = (t) => {
    setSelectedTournament(t);
    setRoomId(t.matchId || '');
    setRoomPassword(t.matchPassword || '');
    setMatchStatus(t.status || 'upcoming');
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!selectedTournament) return;

    setSaving(true);
    try {
      const tRef = doc(db, 'tournaments', selectedTournament.id);
      await updateDoc(tRef, {
        matchId: roomId,
        matchPassword: roomPassword,
        status: matchStatus
      });
      toast.success('Room credentials & match status updated!');
      setSelectedTournament(null);
    } catch (err) {
      toast.error('Failed to update credentials.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'tournaments', id));
      toast.success('Tournament removed.');
    } catch (err) {
      toast.error('Failed to delete tournament.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaGamepad className="text-secondary text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider">
              MANAGE TOURNAMENTS & ROOM PASSWORDS
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Dispatch Custom Room IDs, change live status & finalize results
          </p>
        </div>
      </div>

      {/* Tournaments Table / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-dark-700/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="gaming-card p-4 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={t.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80'}
                  alt={t.title}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                      {t.mode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-black text-accent border border-accent/40">
                      {t.map}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider ${
                      t.status === 'live' ? 'bg-red-950 text-red-400 animate-pulse' :
                      t.status === 'completed' ? 'bg-gray-800 text-gray-400' : 'bg-blue-950 text-blue-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-white">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mt-1">
                    <span>{t.date} @ {t.time}</span>
                    <span>Fee: ₹{t.entryFee}</span>
                    <span>Pool: ₹{t.prizePool}</span>
                    <span>Slots: {t.currentPlayers || 0}/{t.maxPlayers || 48}</span>
                  </div>

                  {/* Room ID Badge */}
                  <div className="mt-2 text-xs font-mono">
                    <span className="text-gray-400">Room: </span>
                    <span className="text-accent font-bold">{t.matchId || 'Not set'}</span>
                    <span className="text-gray-400 ml-3">Pass: </span>
                    <span className="text-primary font-bold">{t.matchPassword || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openCredentialsModal(t)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/20 border border-accent/50 text-accent hover:bg-accent hover:text-black font-heading text-xs font-bold transition-all"
                >
                  <FaKey />
                  <span>SET ROOM / STATUS</span>
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.title)}
                  className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 hover:text-white transition-colors"
                  title="Delete Tournament"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 gaming-card rounded-2xl border-dashed border-white/10">
          <p className="text-sm font-heading text-gray-300">No tournaments found in arena</p>
        </div>
      )}

      {/* Edit Room Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md gaming-card rounded-2xl p-6 border border-accent/40 relative">
            <h3 className="font-heading font-bold text-base text-white uppercase mb-1">
              CONFIGURE ROOM CREDENTIALS
            </h3>
            <p className="text-xs font-mono text-gray-400 mb-4 truncate">
              {selectedTournament.title}
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-heading text-accent uppercase mb-1">
                  Custom Room ID (Free Fire)
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. 8839201"
                  required
                  className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading text-accent uppercase mb-1">
                  Custom Room Password
                </label>
                <input
                  type="text"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="e.g. 1234"
                  required
                  className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading text-gray-300 uppercase mb-1">
                  Tournament Match Status
                </label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-sm text-white focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">🔴 Live In Progress</option>
                  <option value="completed">Completed / Ended</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTournament(null)}
                  className="flex-1 py-2.5 rounded-xl font-heading text-xs font-bold btn-secondary"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-heading text-xs font-bold bg-gradient-to-r from-accent to-secondary text-black font-black"
                >
                  {saving ? 'UPDATING...' : 'DISPATCH TO PLAYERS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTournaments;
