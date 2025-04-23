import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  saveMessage,
  getMessages,
  getConversations,
  getUnreadCount,
  markMessagesAsRead,
  getUnreadMessagesCount,
  deleteMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/messages", verifyToken, saveMessage);
router.get("/messages/:roomId", verifyToken, getMessages);
router.get("/conversations", verifyToken, getConversations);
router.get("/unread-count", verifyToken, getUnreadCount);
router.post("/mark-read/:roomId", verifyToken, markMessagesAsRead);
router.get("/unread-messages-count", verifyToken, getUnreadMessagesCount);
router.delete("/messages/:messageId", verifyToken, deleteMessage);

export default router;
