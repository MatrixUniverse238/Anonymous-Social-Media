import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PostCard = ({ post, onUpvote }) => {
  const { user } = useAuth();

  const handleUpvote = async () => {
    if (!user) return;

    try {
      await api.put(`/posts/${post._id}/upvote`);
      onUpvote(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Fix media URL
  const mediaUrl = post.media
    ? post.media.startsWith("http")
      ? post.media
      : `http://localhost:5000${post.media}`
    : null;

  // Detect video
  const isVideo =
    mediaUrl &&
    (mediaUrl.endsWith(".mp4") ||
      mediaUrl.endsWith(".webm") ||
      mediaUrl.endsWith(".ogg"));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow hover:shadow-lg transition">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          {post.author?.username?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div>
          <p className="text-white text-sm font-medium">
            {post.isAnonymous ? "🕵️ Anonymous" : `@${post.author?.username}`}
          </p>

          <p className="text-gray-500 text-xs">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* TEXT */}
      <div className="px-4 pb-3">
        <Link to={`/posts/${post._id}`}>
          <h2 className="text-white font-semibold text-lg hover:text-purple-400 transition">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-300 text-sm mt-1">{post.body}</p>
      </div>

      {/* MEDIA */}
      {mediaUrl && (
        <div className="bg-black">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[500px] object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="post"
              className="w-full max-h-[500px] object-cover"
            />
          )}
        </div>
      )}

      {/* TAGS */}
      {post.tags?.length > 0 && (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* STATS */}
      <div className="flex justify-between text-gray-400 text-sm px-4 py-2 border-t border-gray-800">
        <span>👍 {post.upvotes?.length || 0}</span>
        <span>💬 {post.commentCount || 0}</span>
        <span>👁 {post.views || 0}</span>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-around border-t border-gray-800 text-gray-400 text-sm">
        <button
          onClick={handleUpvote}
          className="flex-1 py-2 hover:bg-gray-800 transition"
        >
          👍 Like
        </button>

        <Link
          to={`/posts/${post._id}`}
          className="flex-1 py-2 text-center hover:bg-gray-800 transition"
        >
          💬 Comment
        </Link>

        <button className="flex-1 py-2 hover:bg-gray-800 transition">
          🔗 Share
        </button>
      </div>
    </div>
  );
};

export default PostCard;