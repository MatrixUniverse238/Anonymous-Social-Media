// client/src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminPanel = () => {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [reports, setReports] = useState([]);
  const [tab,     setTab]     = useState('stats');

  useEffect(() => {
    const fetchStats   = async () => {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    };
    const fetchUsers   = async () => {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    };
    const fetchReports = async () => {
      const { data } = await api.get('/admin/reports');
      setReports(data.reports);
    };
    fetchStats(); fetchUsers(); fetchReports();
  }, []);

  const handleBan = async (userId) => {
    await api.put(`/admin/users/${userId}/ban`, { reason: 'Admin action' });
    setUsers((prev) =>
      prev.map((u) => u._id === userId ? { ...u, isBanned: !u.isBanned } : u)
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">🛡️ Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['stats', 'users', 'reports'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${
                tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-gray-900 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="bg-gray-900 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">@{u.username}</p>
                  <p className="text-gray-500 text-xs">{u.email} · {u.role}</p>
                  {u.isBanned && (
                    <p className="text-red-400 text-xs mt-1">Banned: {u.banReason}</p>
                  )}
                </div>
                <button onClick={() => handleBan(u._id)}
                  className={`px-3 py-1 rounded text-xs ${
                    u.isBanned
                      ? 'bg-green-900/40 text-green-400 hover:bg-green-900/60'
                      : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                  }`}>
                  {u.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">No pending reports</p>
            ) : reports.map((r) => (
              <div key={r._id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Reported by @{r.reportedBy?.username}</span>
                  <span className="capitalize bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded">
                    {r.status}
                  </span>
                </div>
                <p className="text-white text-sm">Reason: <span className="text-red-400">{r.reason}</span></p>
                {r.description && <p className="text-gray-400 text-xs mt-1">{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;