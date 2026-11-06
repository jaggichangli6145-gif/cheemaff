import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaBan, FaCheck, FaCoins, FaGamepad, FaUserShield } from 'react-icons/fa';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceBonus, setBalanceBonus] = useState(100);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.warn('Users snapshot notice:', err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleBlockStatus = async (user) => {
    const newStatus = !user.isBlocked;
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isBlocked: newStatus
      });
      toast.success(`User ${user.username} is now ${newStatus ? 'BLOCKED' : 'UNBLOCKED'}`);
    } catch (err) {
      toast.error('Failed to change block status.');
    }
  };

  const handleGrantBonus = async (userId) => {
    const amt = Number(balanceBonus);
    if (!amt) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        balance: increment(amt)
      });
      toast.success(`Granted ₹${amt} credits to warrior!`);
      setSelectedUser(null);
    } catch (err) {
      toast.error('Failed to grant bonus.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.freeFireUid?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-blue-400 text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider">
              MANAGE ARENA WARRIORS
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Player Directory, In-Game UID Verification & Suspension Controls
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, email, UID..."
            className="w-full pl-9 pr-3 py-2 bg-black/70 border border-white/15 focus:border-blue-400 rounded-xl text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-dark-700/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="gaming-card rounded-2xl overflow-hidden border border-white/10">
          <div className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                    alt={u.username}
                    className="w-10 h-10 rounded-xl border border-white/10 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-white">{u.username}</h4>
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-yellow-950 text-accent border border-accent/40">
                          ADMIN
                        </span>
                      )}
                      {u.isBlocked && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-heading font-bold bg-red-950 text-red-400 border border-red-500">
                          BANNED
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 mt-0.5">
                      <span>UID: <strong className="text-white">{u.freeFireUid || 'N/A'}</strong></span>
                      <span>Email: {u.email}</span>
                      <span>Balance: <strong className="text-accent">₹{u.balance || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-accent/40 text-accent font-heading text-xs font-bold hover:bg-yellow-900/50 transition-colors flex items-center gap-1.5"
                  >
                    <FaCoins />
                    <span>GRANT BONUS</span>
                  </button>

                  <button
                    onClick={() => toggleBlockStatus(u)}
                    className={`px-3 py-1.5 rounded-lg font-heading text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      u.isBlocked
                        ? 'bg-green-950/60 border border-green-500 text-green-400 hover:bg-green-900/60'
                        : 'bg-red-950/60 border border-red-500 text-red-400 hover:bg-red-900/60'
                    }`}
                  >
                    {u.isBlocked ? (
                      <>
                        <FaCheck /> <span>UNBAN</span>
                      </>
                    ) : (
                      <>
                        <FaBan /> <span>BAN USER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 gaming-card rounded-2xl border-dashed border-white/10">
          <p className="text-sm font-heading text-gray-300">No users found matching search</p>
        </div>
      )}

      {/* Grant Bonus Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm gaming-card rounded-2xl p-6 border border-accent/40">
            <h3 className="font-heading font-bold text-sm text-white uppercase mb-2">
              GRANT BALANCE / BONUS
            </h3>
            <p className="text-xs font-mono text-gray-400 mb-4">
              Adding cash to warrior: <strong className="text-accent">{selectedUser.username}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-heading text-gray-300 uppercase mb-1">
                Credit Amount (₹)
              </label>
              <input
                type="number"
                min="10"
                value={balanceBonus}
                onChange={(e) => setBalanceBonus(e.target.value)}
                className="w-full px-3 py-2 bg-black/80 border border-white/15 focus:border-accent rounded-xl text-base font-bold font-mono text-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2 rounded-xl font-heading text-xs font-bold btn-secondary"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handleGrantBonus(selectedUser.id)}
                className="flex-1 py-2 rounded-xl font-heading text-xs font-bold bg-accent text-black font-black"
              >
                CONFIRM CREDIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
