// client/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center mt-20 text-gray-500">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;