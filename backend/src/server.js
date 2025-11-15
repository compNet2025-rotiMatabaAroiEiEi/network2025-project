const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const {Server} = require("socket.io");
const { initDB } = require("./db");
const handlers = require("./socket-handler");

dotenv.config({ path: "./config/config.env"});

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("register", handlers.registerHandler(io, socket));
  socket.on("broadcast", handlers.broadcastHandler(io, socket));
  socket.on("privateMessage", handlers.privateMessageHandler(io, socket));
  socket.on("groupMessage", handlers.groupMessageHandler(io, socket));
  socket.on("getUsers", handlers.getUsersHandler(socket));
  socket.on("getGroups", handlers.getGroupsHandler(socket));
  socket.on("createGroup", handlers.createGroupHandler(io, socket));
  socket.on("getMessageHistory", handlers.getMessageHistoryHandler(socket));
  socket.on("typing", handlers.typingHandler(io, socket));
  socket.on("userStatus", handlers.userStatusHandler(io, socket));
  socket.on("messageRead", handlers.messageReadHandler(io, socket));
  socket.on("logout", handlers.logoutHandler(io, socket));
  socket.on("disconnect", handlers.disconnectHandler(io, socket));
});


app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running!", status: "ok" });
});

const PORT = process.env.PORT;

// Initialize database and start server
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
