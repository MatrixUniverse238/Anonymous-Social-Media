// client/src/pages/Inbox.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Inbox = () => {
  const [inbox,   setInbox]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user }        = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await api.get('/messages/inbox');
        setInbox(data.inbox);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  if (loading) return (
    <div className="text-center text-gray-500 mt-20">Loading inbox...</div>
  );

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">💬 Inbox</h1>

        {inbox.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {inbox.map((msg) => {
              // correctly identify the OTHER person in conversation
              const isSender = msg.sender?._id === user.id ||
                               msg.sender?.id  === user.id;

              const otherUser = isSender ? msg.receiver : msg.sender;
              const otherId   = otherUser?._id || otherUser?.id;
              const otherName = otherUser?.username || 'Anonymous';
              const isOnline  = onlineUsers.includes(otherId);

              return (
                <Link
                  key={msg._id}
                  to={`/chat/${otherId}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-purple-700 rounded-xl p-4 transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        @{otherName}
                      </span>
                      {isOnline && (
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate">{msg.content}</p>
                  {!msg.isRead && !isSender && (
                    <span className="text-xs text-purple-400 mt-1 block">
                      New message
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;