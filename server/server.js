// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ──
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── REST Routes ──
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/uploads", express.static("uploads"));

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ message: "Anon Social API is running" });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

/* ==============================
   SOCKET.IO LOGIC
================================ */

const onlineUsers = new Map(); // userId → socketId

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // USER ONLINE
  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("User online:", userId);
  });

  // SEND MESSAGE
  socket.on("sendMessage", async (data) => {
    try {
      const Message = require("./models/Message");
      const jwt = require("jsonwebtoken");

      const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
      const senderId = decoded.id;

      const message = await Message.create({
        sender: senderId,
        receiver: data.receiverId,
        content: data.content,
        isAnonymous: data.isAnonymous || false,
        status: "sent", // IMPORTANT
      });

      await message.populate({
        path: "sender",
        select: "username avatar",
      });

      const payload = {
        ...message.toJSON(),
        sender: data.isAnonymous
          ? { username: "Anonymous" }
          : message.sender,
      };

      // SEND TO RECEIVER
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", payload);
      }

      // CONFIRM SENDER
      socket.emit("messageSent", payload);
    } catch (error) {
      socket.emit("messageError", { message: error.message });
    }
  });

  // MESSAGE DELIVERED
  socket.on("messageDelivered", async (messageId) => {
    try {
      const Message = require("./models/Message");

      const updated = await Message.findByIdAndUpdate(
        messageId,
        { status: "delivered" },
        { returnDocument: "after" }
      );

      io.emit("messageStatus", updated);
    } catch (err) {
      console.error("Delivered error:", err.message);
    }
  });

  // MESSAGE SEEN
  socket.on("messageSeen", async ({ messageId }) => {
    try {
      const Message = require("./models/Message");

      const updated = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { returnDocument: "after" }
      );

      io.emit("messageStatus", updated);
    } catch (err) {
      console.error("Seen error:", err.message);
    }
  });

  // USER DISCONNECT
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("User offline:", userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});