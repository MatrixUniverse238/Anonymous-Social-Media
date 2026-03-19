// client/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
    <p className="text-gray-400 mb-6">This page doesn't exist</p>
    <Link to="/" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg">
      Go Home
    </Link>
  </div>
);

export default NotFound;