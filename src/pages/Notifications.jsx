import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaTrophy, 
  FaWallet, 
  FaGamepad, 
  FaInfoCircle, 
  FaCheckDouble, 
  FaTrash,
  FaCheck
} from 'react-icons/fa';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(list);
        setLoading(false);
      }, (err) => {
        console.warn('Notifications fetch notice:', err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setLoading(false);
    }
  }, [currentUser]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unread = notifications.filter(n => !n.read);
      unread.forEach(n => {
        const ref = doc(db, 'notifications', n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed to update notifications');
    }
  };

  // Clear single notification
  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast.success('Notification removed');
    } catch (e) {
      toast.error('Failed to remove notification');
    }
  };

  // Helper for notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament':
        return <FaTrophy className="text-accent" />;
      case 'match':
        return <FaGamepad className="text-primary" />;
      case 'payment':
        return <FaWallet className="text-green-400" />;
      case 'system':
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FaBell className="text-primary text-xl" />
            <h1 className="font-heading font-black text-2xl text-white tracking-wider glow-text-red">
              NOTIFICATIONS
            </h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-1">
            Tournament Alerts, Room Credentials & Wallet Updates
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary text-xs font-heading text-gray-300 hover:text-white transition-all"
          >
            <FaCheckDouble className="text-primary" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-dark-700/40 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.read && markAsRead(item.id)}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.read
                  ? 'bg-black/50 border-white/5 opacity-80'
                  : 'bg-dark-700/80 border-primary/40 shadow-[0_0_12px_rgba(255,45,45,0.15)] cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-base">
                  {getNotificationIcon(item.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-sm text-white">{item.title}</h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse shadow-[0_0_6px_#ff2d2d]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 font-mono mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] font-mono text-gray-500 mt-2 block">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString('en-IN') : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Delete notification"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 gaming-card rounded-2xl border-dashed border-white/10">
          <FaBell className="text-gray-600 text-4xl mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-white">No New Notifications</h3>
          <p className="text-xs font-mono text-gray-400 mt-1 max-w-sm mx-auto">
            You're all caught up! You'll receive instant alerts whenever you join scrims or earn prizes.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
