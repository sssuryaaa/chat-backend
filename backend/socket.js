const Message = require("./models/Message");
const User = require("./models/User");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    socket.join(socket.user.id);
    User.findByIdAndUpdate(socket.user.id, { isOnline: true }).catch((err) => {
      console.error("Failed to set user online:", err);
    });

    socket.on("send-message", async ({ receiverId, content }) => {
      const message = await Message.create({
        sender: socket.user.id,
        receiver: receiverId,
        content,
      });

      io.to(receiverId).emit("receive-message", message);
      // io.to(socket.user.id).emit("receive-message", message);
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user.id);

      try {
        const sockets = await io.in(socket.user.id).allSockets();
        if (sockets.size === 0) {
          await User.findByIdAndUpdate(socket.user.id, { isOnline: false });
        }
      } catch (err) {
        console.error("Failed to set user offline:", err);
      }
    });
  });
};

module.exports = socketHandler;
