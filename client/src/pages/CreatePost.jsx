import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreatePost = () => {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* HANDLE MEDIA */
  const handleMedia = (file) => {

    if (!file) return;

    const allowed = ["image/", "video/"];

    if (!allowed.some(type => file.type.startsWith(type))) {
      setError("Only images or videos allowed");
      return;
    }

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    handleMedia(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleMedia(e.dataTransfer.files[0]);
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview(null);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const tagArray = tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("body", body);
      formData.append("tags", JSON.stringify(tagArray));
      formData.append("isAnonymous", isAnonymous);

      if (media) {
        formData.append("media", media);
      }

      const { data } = await api.post("/posts", formData);

      navigate(`/posts/${data.post._id}`);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to create post"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center px-4 py-10">

      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-bold text-white mb-6">
          Create Post
        </h1>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-xl p-6 space-y-6 shadow-lg"
        >

          {/* TITLE */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="What's happening?"
            />
          </div>

          {/* BODY */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Description
            </label>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none resize-none"
              placeholder="Share your thoughts..."
            />
          </div>

          {/* MEDIA */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer"
          >

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />

            <label htmlFor="fileUpload" className="cursor-pointer">

              <p className="text-gray-400 text-sm">
                Drag & Drop Image / Video
              </p>

              <p className="text-purple-400 font-medium">
                or Click to Upload
              </p>

            </label>

            {preview && (

              <div className="mt-4 relative">

                {media?.type.startsWith("image") ? (

                  <img
                    src={preview}
                    alt="preview"
                    className="rounded-lg max-h-80 mx-auto"
                  />

                ) : (

                  <video
                    src={preview}
                    controls
                    className="rounded-lg max-h-80 mx-auto"
                  />

                )}

                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>

              </div>

            )}

          </div>

          {/* TAGS */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Tags
            </label>

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              placeholder="confession, advice, rant"
            />
          </div>

          {/* ANONYMOUS */}
          <label className="flex items-center gap-2 text-gray-300 text-sm">

            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="accent-purple-500"
            />

            Post anonymously 🕵️

          </label>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 transition text-white py-2 rounded-lg font-medium"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default CreatePost;