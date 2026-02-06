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

app.use(cors());
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

const io = new Server(server, {
  cors: { origin: "*" },
});

// Socket auth middleware
io.use(socketAuth);

// Socket logic
socketHandler(io);

server.listen(5000, () => console.log("Server running on port 5000"));
