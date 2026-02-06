const Message = require("./models/Message");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    socket.join(socket.user.id);

    socket.on("send-message", async ({ receiverId, content }) => {
      const message = await Message.create({
        sender: socket.user.id,
        receiver: receiverId,
        content,
      });

      io.to(receiverId).emit("receive-message", message);
      io.to(socket.user.id).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
};

module.exports = socketHandler;
