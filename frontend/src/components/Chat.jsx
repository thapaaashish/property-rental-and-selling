import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { Send, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  query: { userId: JSON.parse(localStorage.getItem("currentUser"))?._id },
});

const Chat = ({
  userId,
  roomId,
  receiverId,
  receiverAvatar,
  receiverName,
  currentUserAvatar,
}) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Normalize senderId/receiverId to string
  const normalizeMessage = (msg) => ({
    ...msg,
    senderId:
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId,
    receiverId:
      typeof msg.receiverId === "object" ? msg.receiverId._id : msg.receiverId,
  });

  // Debounce socket message handling
  const handleSocketMessage = useCallback((message) => {
    console.log("Received socket message:", message); // Debug
    setMessages((prevMessages) => {
      const exists = prevMessages.some((msg) => msg._id === message._id);
      if (exists) return prevMessages;
      return [...prevMessages, normalizeMessage(message)];
    });
  }, []);

  // Handle delete message event
  const handleDeleteMessage = useCallback(({ messageId }) => {
    console.log("Received deleteMessage:", messageId); // Debug
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== messageId)
    );
  }, []);

  useEffect(() => {
    if (!currentUser || !userId || userId !== currentUser._id) {
      console.error("User ID mismatch:", {
        userId,
        currentUserId: currentUser?._id,
      });
      setError("User authentication error. Please sign in again.");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    socket.emit("joinRoom", roomId);

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const messagesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/messages/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
          }
        );
        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages");
        }
        const messagesData = await messagesResponse.json();
        console.log("Fetched messages:", messagesData.data); // Debug
        const normalizedMessages = Array.isArray(messagesData.data)
          ? messagesData.data.map(normalizeMessage)
          : [];
        setMessages(normalizedMessages);

        const readResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/mark-read/${roomId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentUser.refreshToken}`,
            },
          }
        );
        if (readResponse.ok) {
          const readData = await readResponse.json();
          console.log("Marked messages as read:", readData.data); // Debug
          setMessages(
            Array.isArray(readData.data)
              ? readData.data.map(normalizeMessage)
              : normalizedMessages
          );
        } else {
          console.warn("Failed to mark messages as read");
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        setError("Unable to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    socket.on("message", handleSocketMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("message", handleSocketMessage);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId, currentUser, userId, handleSocketMessage, handleDeleteMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      senderId: userId,
      receiverId,
      content: newMessage,
      timestamp: new Date(),
    };

    console.log("Sending message:", messageData); // Debug

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const savedMessage = await response.json();
        console.log("Saved message:", savedMessage.data); // Debug
        socket.emit("sendMessage", savedMessage.data);
        setNewMessage("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUser.refreshToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Deleted message:", messageId); // Debug
        socket.emit("deleteMessage", { roomId, messageId });
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-teal-50 p-4 border-b border-gray-200 flex items-center space-x-3">
        <img
          src={receiverAvatar}
          alt={receiverName}
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => (e.target.src = "/placeholder.svg")}
        />
        <h3 className="text-lg font-semibold text-teal-700">
          Chat with {receiverName}
        </h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-4 flex items-start ${
                msg.senderId.toString() === userId.toString()
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {msg.senderId.toString() !== userId.toString() && (
                <img
                  src={receiverAvatar}
                  alt={receiverName}
                  className="h-8 w-8 rounded-full object-cover mr-2 mt-1"
                  onError={(e) => (e.target.src = "/placeholder.svg")}
                />
              )}
              <div
                className={`max-w-xs p-3 rounded-lg flex items-center space-x-2 ${
                  msg.senderId.toString() === userId.toString()
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{msg.content}</p>
                {msg.senderId.toString() === userId.toString() && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="text-red-300 hover:text-red-500 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <p className="text-xs mt-1 opacity-75 flex items-center">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                  {msg.senderId.toString() === userId.toString() &&
                    msg.read && <span className="ml-1">✓✓</span>}
                </p>
              </div>
              {msg.senderId.toString() === userId.toString() && (
                <img
                  src={currentUserAvatar}
                  alt="You"
                  className="h-8 w-8 rounded-full object-cover ml-2 mt-1"
                  onError={(e) => (e.target.src = "/placeholder.svg")}
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
