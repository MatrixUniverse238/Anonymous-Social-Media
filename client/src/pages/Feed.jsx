import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const Feed = () => {

  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchPosts = async (p = 1) => {

    try {

      setLoading(true);

      const { data } = await api.get(`/posts?page=${p}&limit=10`);

      setPosts(data.posts);
      setPages(data.pages);
      setPage(p);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpvote = (postId) => {

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, upvotes: [...(p.upvotes || []), "temp"] }
          : p
      )
    );

  };

  return (

    <div className="min-h-screen bg-gray-950">

      {/* Feed container */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Create Post Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 shadow">

          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Create input */}
            <Link
              to="/create"
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-full text-sm transition"
            >
              What's on your mind?
            </Link>

          </div>

          {/* Create options */}
          <div className="flex justify-around mt-4 text-sm text-gray-400 border-t border-gray-800 pt-3">

            <Link
              to="/create"
              className="flex items-center gap-1 hover:text-purple-400"
            >
              📷 Photo
            </Link>

            <Link
              to="/create"
              className="flex items-center gap-1 hover:text-purple-400"
            >
              🎥 Video
            </Link>

            <Link
              to="/create"
              className="flex items-center gap-1 hover:text-purple-400"
            >
              🕵️ Anonymous
            </Link>

          </div>

        </div>

        {/* Feed Title */}
        <h1 className="text-xl font-semibold text-white mb-4">
          Latest Posts
        </h1>

        {/* Loading */}
        {loading ? (

          <div className="text-center text-gray-500 mt-20">
            Loading posts...
          </div>

        ) : posts.length === 0 ? (

          <div className="text-center text-gray-500 mt-20">

            No posts yet.

            <Link
              to="/create"
              className="text-purple-400 hover:underline ml-1"
            >
              Create the first post
            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {posts.map((post) => (

              <PostCard
                key={post._id}
                post={post}
                onUpvote={handleUpvote}
              />

            ))}

          </div>

        )}

        {/* Pagination */}
        {pages > 1 && (

          <div className="flex justify-center gap-2 mt-8">

            {Array.from({ length: pages }, (_, i) => (

              <button
                key={i}
                onClick={() => fetchPosts(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  page === i + 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>

            ))}

          </div>

        )}

      </div>

    </div>

  );

};

export default Feed;