require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const socketAuth = require("./middleware/auth");
const socketHandler = require("./socket");
const httpAuth = require("./middleware/httpAuth");
const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

connectDB();

const corsOptions = {
  origin: "http://localhost:1234",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:1234");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});
app.use(express.json());

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/chats", httpAuth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username email")
      .populate("receiver", "username email");

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/messages/:userId", httpAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username email")
      .populate("receiver", "username email");

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/messages", httpAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body || {};
    if (!receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "username email")
      .populate("receiver", "username email");

    // io.to(req.user.id).emit("message:new", fullMessage);
    io.to(receiverId).emit("message:new", fullMessage);

    return res.status(201).json({ message: fullMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/messages/:messageId/viewed", httpAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ message: "Missing messageId" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isViewed: true },
      { new: true },
    )
      .populate("sender", "username email")
      .populate("receiver", "username email");

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    io.to(String(updatedMessage.sender._id)).emit("message:viewed", {
      messageId: updatedMessage._id,
      isViewed: true,
    });
    io.to(String(updatedMessage.receiver._id)).emit("message:viewed", {
      messageId: updatedMessage._id,
      isViewed: true,
    });

    return res.json({ message: updatedMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/messages/:messageId/viewed", httpAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ message: "Missing messageId" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isViewed: true },
      { new: true },
    )
      .populate("sender", "username email")
      .populate("receiver", "username email");

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // io.to(String(updatedMessage.sender._id)).emit("message:viewed", {
    //   messageId: updatedMessage._id,
    //   isViewed: true,
    // });
    io.to(String(updatedMessage.receiver._id)).emit("message:viewed", {
      messageId: updatedMessage._id,
      isViewed: false,
    });

    return res.json({ message: updatedMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/users", httpAuth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "_id username email",
    );
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/userId", httpAuth, (req, res) => {
  return res.json({ userId: req.user.id });
});

const io = new Server(server, {
  cors: { origin: "*" },
});

// Socket auth middleware
io.use(socketAuth);

// Socket logic
socketHandler(io);

server.listen(5000, () => console.log("Server running on port 5000"));
