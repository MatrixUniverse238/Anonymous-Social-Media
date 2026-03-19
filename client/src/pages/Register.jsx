// client/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form,  setForm]  = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
        <p className="text-gray-400 text-sm mb-6">Join anonymously. No judgement.</p>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
              placeholder="anonymous_user"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;