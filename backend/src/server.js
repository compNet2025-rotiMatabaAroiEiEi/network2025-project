const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const {Server} = require("socket.io");;
const http = require("http");
const handlers = require("./socket-handler");

//  before release update this to config.env file
dotenv.config({ path: "./config/config.env"});
const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("register", handlers.registerHandler(socket));
  socket.on("broadcast", handlers.broadcastHandler(io, socket));
  socket.on("privateMessage", handlers.privateMessageHandler(io, socket));
  socket.on("getUsers", handlers.getUsersHandler(socket));
  socket.on("disconnect", handlers.disconnectHandler(socket));
});


app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running!", status: "ok" });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  //console.log("DB URL at runtime:", process.env.DATABASE_URL);
});
