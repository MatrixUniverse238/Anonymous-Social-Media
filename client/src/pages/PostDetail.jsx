import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`)
        ]);

        setPost(postRes.data.post);
        setComments(commentsRes.data.comments);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpvote = async () => {
    if (!user) return navigate("/login");

    const { data } = await api.put(`/posts/${id}/upvote`);

    setPost((p) => ({
      ...p,
      upvotes: Array(data.upvotes).fill("")
    }));
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!body.trim()) return;

    const { data } = await api.post(`/posts/${id}/comments`, {
      body,
      isAnonymous: anon
    });

    setComments((prev) => [data.comment, ...prev]);
    setBody("");
  };

  if (loading)
    return (
      <div className="text-center text-gray-500 mt-20">
        Loading...
      </div>
    );

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">

        {/* POST CARD */}
        <div className="bg-gray-900 rounded-xl shadow border border-gray-800">

          {/* HEADER */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-800">

            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {post.author?.username?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <p className="text-white text-sm font-medium">
                {post.isAnonymous
                  ? "🕵️ Anonymous"
                  : `@${post.author?.username}`}
              </p>

              <p className="text-gray-500 text-xs">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>

          </div>

          {/* CONTENT */}
          <div className="p-4">

            <h1 className="text-xl font-semibold text-white mb-2">
              {post.title}
            </h1>

            <p className="text-gray-300 mb-4 leading-relaxed">
              {post.body}
            </p>

            {/* MEDIA */}
            {post.media && (
              <div className="rounded-lg overflow-hidden mb-4">

                {post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={`http://localhost:5000${post.media}`}
                    controls
                    className="w-full"
                  />
                ) : (
                  <img
                    src={`http://localhost:5000${post.media}`}
                    alt="post"
                    className="w-full"
                  />
                )}

              </div>
            )}

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mb-3">

              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}

            </div>

            {/* STATS */}
            <div className="flex justify-between text-sm text-gray-500 border-t border-gray-800 pt-3">

              <span>
                👍 {post.upvotes?.length || 0} likes
              </span>

              <span>
                💬 {comments.length} comments
              </span>

              <span>
                👁 {post.views} views
              </span>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-around border-t border-gray-800 mt-3 pt-3 text-sm text-gray-400">

              <button
                onClick={handleUpvote}
                className="hover:text-purple-400 transition"
              >
                👍 Like
              </button>

              <button className="hover:text-purple-400">
                💬 Comment
              </button>

              <button className="hover:text-purple-400">
                🔗 Share
              </button>

            </div>

          </div>
        </div>

        {/* COMMENT BOX */}
        {user && (
          <form
            onSubmit={handleComment}
            className="bg-gray-900 rounded-xl p-4 border border-gray-800"
          >

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Write a comment..."
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 resize-none text-sm mb-3"
            />

            <div className="flex justify-between items-center">

              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">

                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="accent-purple-500"
                />

                Anonymous

              </label>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-sm"
              >
                Comment
              </button>

            </div>

          </form>
        )}

        {/* COMMENTS */}
        <div className="space-y-4">

          {comments.map((c) => (

            <div
              key={c._id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
            >

              <div className="flex items-center gap-3 mb-2">

                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                  {c.author?.username?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div>

                  <p className="text-white text-sm">
                    {c.isAnonymous
                      ? "🕵️ Anonymous"
                      : `@${c.author?.username}`}
                  </p>

                  <p className="text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>

                </div>

              </div>

              <p className="text-gray-300 text-sm">
                {c.body}
              </p>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
};

export default PostDetail;