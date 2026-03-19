import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [typingUser, setTypingUser] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  /* FETCH CONVERSATION */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, userRes] = await Promise.all([
          api.get(`/messages/${userId}`),
          api
            .get(`/admin/users/${userId}`)
            .catch(() => ({ data: { user: { username: userId } } })),
        ]);

        setMessages(msgRes.data.messages);
        setOtherUser(userRes.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  /* SOCKET EVENTS */
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);

      // notify server message delivered
      socket.emit("messageDelivered", msg._id);
    };

    const handleSent = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleStatus = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMsg._id ? updatedMsg : m
        )
      );
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === userId) {
        setTypingUser(true);

        setTimeout(() => {
          setTypingUser(false);
        }, 2000);
      }
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("messageSent", handleSent);
    socket.on("messageStatus", handleStatus);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageSent", handleSent);
      socket.off("messageStatus", handleStatus);
      socket.off("typing", handleTyping);
    };
  }, [socket, userId]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND MESSAGE */
  const handleSend = (e) => {
    e.preventDefault();

    if (!content.trim() || !socket) return;

    const token = localStorage.getItem("token");

    socket.emit("sendMessage", {
      token,
      receiverId: userId,
      content: content.trim(),
      isAnonymous,
    });

    setContent("");
  };

  /* TYPING EVENT */
  const handleTyping = (e) => {
    setContent(e.target.value);

    socket.emit("typing", {
      senderId: user.id,
      receiverId: userId,
    });
  };

  /* MARK MESSAGES AS SEEN */
  useEffect(() => {
    if (!socket) return;

    messages.forEach((msg) => {

      // only mark messages you RECEIVED
      if (
        msg.receiver === user.id &&
        msg.sender !== user.id &&
        msg.status !== "seen"
      ) {
        socket.emit("messageSeen", { messageId: msg._id });
      }

    });

  }, [messages, socket, user.id]);

  const isOnline = onlineUsers.includes(userId);

  if (loading)
    return (
      <div className="text-center text-gray-500 mt-20">
        Loading chat...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col border-x border-gray-800">

        {/* HEADER */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {otherUser?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-white font-semibold">
              @{otherUser?.username || "User"}
            </p>

            <p className="text-xs text-gray-500 flex items-center gap-1">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Active now
                </>
              ) : (
                "Offline"
              )}
            </p>
          </div>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

          {messages.map((msg, i) => {

            const isMine =
              msg.sender?._id === user.id ||
              msg.sender?.id === user.id ||
              msg.sender === user.id;

            return (
              <div
                key={msg._id || i}
                className={`flex items-end gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >

                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                    {msg.sender?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 text-sm shadow ${
                    isMine
                      ? "bg-purple-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-800 text-gray-200 rounded-2xl rounded-bl-sm"
                  }`}
                >

                  <p className="leading-relaxed">{msg.content}</p>

                  {/* MESSAGE STATUS */}
                  {isMine && (
                    <p className="text-[10px] mt-1 flex justify-end gap-1">

                      {msg.status === "sent" && "✓"}

                      {msg.status === "delivered" && "✓✓"}

                      {msg.status === "seen" && (
                        <span className="text-blue-400">✓✓</span>
                      )}

                    </p>
                  )}

                </div>

              </div>
            );
          })}

          <div ref={bottomRef} />

        </div>

        {/* TYPING INDICATOR */}
        {typingUser && (
          <p className="text-xs text-gray-500 px-4 pb-2">
            @{otherUser?.username} is typing...
          </p>
        )}

        {/* INPUT */}
        <form
          onSubmit={handleSend}
          className="bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center gap-3"
        >

          <input
            type="text"
            value={content}
            onChange={handleTyping}
            placeholder="Aa"
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-purple-500 text-sm"
          />

          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="accent-purple-500"
            />
            Anon
          </label>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-sm transition"
          >
            Send
          </button>

        </form>

      </div>
    </div>
  );
};

export default Chat;