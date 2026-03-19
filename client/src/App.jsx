// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';
import Feed           from './pages/Feed';
import Login          from './pages/Login';
import Register       from './pages/Register';
import CreatePost     from './pages/CreatePost';
import PostDetail     from './pages/PostDetail';
import AdminPanel     from './pages/AdminPanel';
import Inbox          from './pages/Inbox';
import Chat           from './pages/Chat';
import NotFound       from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"          element={<Feed />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/create"    element={
              <ProtectedRoute><CreatePost /></ProtectedRoute>
            } />
            <Route path="/admin"     element={
              <AdminRoute><AdminPanel /></AdminRoute>
            } />
            <Route path="/inbox"     element={
              <ProtectedRoute><Inbox /></ProtectedRoute>
            } />
            <Route path="/chat/:userId" element={
              <ProtectedRoute><Chat /></ProtectedRoute>
            } />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;