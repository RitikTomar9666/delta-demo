import express from "express";
import Thread from "../models/thread.js";
import { v4 as uuidv4 } from "uuid";
import getOpenAIAPIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ FIX: authMiddleware lagaya + sirf us user ke threads fetch karo
router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.userId }) // sirf apne threads
      .sort({ updatedAt: -1 })
      .select("threadId title"); // sirf zaruri fields
    res.json(threads);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// ✅ Thread ki messages fetch karo — sirf owner dekh sake
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, userId: req.user.userId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json(thread.messages);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// ✅ Sirf owner delete kar sake
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deleted = await Thread.findOneAndDelete({
      threadId,
      userId: req.user.userId, // security: dusre ka thread delete na ho
    });
    if (!deleted) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.json({ success: "Thread deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete thread" });
  }
});

// ✅ Chat — token se userId aata hai automatically
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    let thread = await Thread.findOne({ threadId });
    if (!thread) {
      thread = new Thread({
        threadId,
        userId: req.user.userId, // ✅ token se milta hai, frontend se nahi
        title: message.slice(0, 40), // pehle 40 chars title banao
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
