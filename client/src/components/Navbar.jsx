import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-wide text-purple-400 hover:text-purple-300 transition"
        >
          🕵️ AnonSocial
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">

          {user ? (
            <>
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition"
              >
                Feed
              </Link>

              {/* Inbox with Notification */}
              <Link
                to="/inbox"
                className="relative text-gray-300 hover:text-white transition flex items-center"
              >
                💬 Inbox

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/create"
                className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 transition text-white"
              >
                + Post
              </Link>

              {(user.role === "admin" || user.role === "moderator") && (
                <Link
                  to="/admin"
                  className="px-3 py-1 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                >
                  Admin Panel
                </Link>
              )}

              <span className="text-gray-400">@{user.username}</span>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 transition text-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 transition text-white"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;