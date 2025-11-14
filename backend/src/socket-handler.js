const { addMessage, getMessages } = require("./db");

const users = {}; // { username: socket.id }
const invertUsers = {}; // { socket.id : username }
const userAvatars = {}; // { username: avatar }

// Register username
exports.registerHandler = (io, socket) => (data) => {
  const name = typeof data === 'string' ? data : data.name;
  const avatar = typeof data === 'object' ? data.avatar : null;
  
  console.log("register user:", name, ", id:", socket.id);
  if (users[name]) {
    socket.emit("registerError", "Username already taken");
  } else {
    users[name] = socket.id;
    invertUsers[socket.id] = name;
    if (avatar) {
      userAvatars[name] = avatar;
    }
    socket.emit("registerSuccess", name);
    console.log("Current users:", users);
    // Broadcast updated user list with avatars to all clients
    const usersList = Object.keys(users).map(username => ({
      name: username,
      avatar: userAvatars[username] || null
    }));
    io.emit("usersList", usersList);
  }
};

exports.broadcastHandler = (io, socket) => async (data) => {
  console.log("Broadcast message:", data, "from", socket.id);
  const messageData = {
    username: invertUsers[socket.id],
    message: data.message,
    timestamp: data.timestamp || new Date().toISOString(),
    userId: socket.id,
    avatar: data.avatar,
    messageType: 'global'
  };
  
  // Save to JSON database
  try {
    addMessage({
      username: messageData.username,
      message: messageData.message,
      avatar: messageData.avatar,
      messageType: 'global',
      timestamp: messageData.timestamp
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
  
  io.emit("message", messageData);
};

// Send private message
exports.privateMessageHandler = (io, socket) => async (data) => {
  const toId = users[data.recipientId];
  if (toId) {
    console.log("Send message:", data.message, "from", socket.id, "to", toId);
    const messageData = {
      username: invertUsers[socket.id],
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      userId: socket.id,
      avatar: data.avatar,
      messageType: 'private',
      recipientId: data.recipientId
    };
    
    // Save to JSON database
    try {
      addMessage({
        username: messageData.username,
        message: messageData.message,
        avatar: messageData.avatar,
        messageType: 'private',
        recipientId: data.recipientId,
        timestamp: messageData.timestamp
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
    
    io.to(toId).emit("message", messageData);
    socket.emit("message", messageData);
  }
};

exports.getUsersHandler = (socket) => () => {
  console.log("Send Users list:", Object.keys(users), "to", socket.id);
  const usersList = Object.keys(users).map(username => ({
    name: username,
    avatar: userAvatars[username] || null
  }));
  socket.emit("usersList", usersList);
};

// Get message history from JSON database
exports.getMessageHistoryHandler = (socket) => (data) => {
  try {
    const { messageType, recipientId, groupId } = data;
    const username = invertUsers[socket.id];
    
    let messages = getMessages(msg => {
      if (messageType === 'global') {
        return msg.messageType === 'global';
      } else if (messageType === 'private') {
        // Get messages between current user and recipient
        return msg.messageType === 'private' && (
          (msg.username === username && msg.recipientId === recipientId) ||
          (msg.username === recipientId && msg.recipientId === username)
        );
      } else if (messageType === 'group') {
        return msg.messageType === 'group' && msg.groupId === groupId;
      }
      return false;
    });
    
    // Sort by timestamp and limit to last 100 messages
    messages = messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-100);
    
    socket.emit("messageHistory", { chatKey: data.chatKey, messages });
  } catch (error) {
    console.error("Error fetching message history:", error);
  }
};

// Group message handler
exports.groupMessageHandler = (io, socket) => async (data) => {
  console.log("Group message:", data, "from", socket.id);
  const messageData = {
    username: invertUsers[socket.id],
    message: data.message,
    timestamp: data.timestamp || new Date().toISOString(),
    userId: socket.id,
    groupId: data.groupId,
    avatar: data.avatar,
    messageType: 'group'
  };
  
  // Save to JSON database
  try {
    addMessage({
      username: messageData.username,
      message: messageData.message,
      avatar: messageData.avatar,
      messageType: 'group',
      groupId: data.groupId,
      timestamp: messageData.timestamp
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
  
  // Emit to all users in the group (for now, broadcast to all)
  io.emit("message", messageData);
};

// Handle disconnect
exports.disconnectHandler = (io, socket) => () => {
  console.log("Client disconnected:", socket.id);
  const username = invertUsers[socket.id];
  if (username) {
    delete users[username];
    delete invertUsers[socket.id];
    delete userAvatars[username];
    console.log(`Removed ${username}`);
    // Broadcast updated user list with avatars to all clients
    const usersList = Object.keys(users).map(username => ({
      name: username,
      avatar: userAvatars[username] || null
    }));
    io.emit("usersList", usersList);
  }
};
