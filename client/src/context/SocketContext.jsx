// client/src/context/SocketContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);

      // Notify server user is online
      newSocket.emit("userOnline", user.id);
    });

    // Receive list of online users
    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // 🔔 NEW MESSAGE EVENT
    newSocket.on("receiveMessage", (msg) => {
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);