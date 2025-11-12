const users = {}; // { username: socket.id }
const invertUsers = {}; // { socket.id : username }

// Register username
exports.registerHandler = (socket) => (name) => {
  console.log("register user:", name, ", id:", socket.id);
  if (users[name]) {
    socket.emit("message", "Username already taken");
  } else {
    users[name] = socket.id;
    invertUsers[socket.id] = name;
    socket.emit("message", "Register success");
  }
  console.log("Current users:", users);
};

exports.broadcastHandler = (io, socket) => (msg) => {
  console.log("Broadcast message:", msg, "from", socket.id);
  io.emit("message", msg);
  socket.emit("message", "Broadcast success");
};

// Send private message
exports.privateMessageHandler = (io, socket) => (to, msg) => {
  const toId = users[to];
  if (toId) {
    console.log("Send message:", msg, "from", socket.id, "to", toId);
    io.to(toId).emit("getPrivateMessage", invertUsers[socket.id], msg);
    socket.emit("message", "Send prevate message success");
  }
};

exports.getUsersHandler = (socket) => () => {
  console.log("Send Users list:", Object.keys(users), "to", socket.id);
  socket.emit("usersList", Object.keys(users));
  socket.emit("message", "Sended user list");
};

// Handle disconnect
exports.disconnectHandler = (socket) => () => {
  console.log("Client disconnected:", socket.id);
  for (const username in users) {
    if (users[username] === socket.id) {
      delete users[username];
      console.log(`Removed ${username}`);
      break;
    }
  }
};
