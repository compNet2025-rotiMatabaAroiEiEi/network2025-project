const { 
  addMessage, 
  getMessagesByType, 
  addGroup, 
  getGroups,
  addUser,
  getOnlineUsers,
  removeUser,
  isUsernameTaken
} = require("./db");

const users = {}; // { username: socket.id } - Keep for quick lookup
const invertUsers = {}; // { socket.id : username } - Keep for quick lookup

// Register username
exports.registerHandler = (io, socket) => (data) => {
  const name = typeof data === 'string' ? data : data.name;
  const avatar = typeof data === 'object' ? data.avatar : null;
  
  console.log("register user:", name, ", id:", socket.id);
  
  // Check if username is already taken (currently online)
  const isTaken = isUsernameTaken(name);
  if (isTaken) {
    socket.emit("registerError", "Username is currently in use. Please try again later or choose a different username.");
    return;
  }
  
  try {
    // Save user to database
    addUser({
      username: name,
      avatar: avatar,
      socketId: socket.id,
      status: 'online'
    });
    
    // Add to in-memory cache for quick lookup
    users[name] = socket.id;
    invertUsers[socket.id] = name;
    
    socket.emit("registerSuccess", name);
    console.log("User saved to database:", name);
    
    // Notify all users that someone came online
    io.emit("userOnline", {
      username: name,
      avatar: avatar,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast updated user list from database
    const onlineUsers = getOnlineUsers();
    const usersList = onlineUsers.map(user => ({
      name: user.username,
      avatar: user.avatar
    }));
    io.emit("usersList", usersList);
  } catch (error) {
    console.error("Error registering user:", error);
    socket.emit("registerError", "Failed to register. Please try again.");
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
  
  // Save to MongoDB
  try {
    await addMessage({
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
    
    // Save to MongoDB
    try {
      await addMessage({
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
  console.log("Send Users list to", socket.id);
  try {
    const onlineUsers = getOnlineUsers();
    const usersList = onlineUsers.map(user => ({
      name: user.username,
      avatar: user.avatar
    }));
    socket.emit("usersList", usersList);
  } catch (error) {
    console.error("Error getting users:", error);
    socket.emit("usersList", []);
  }
};

// Get groups list
exports.getGroupsHandler = (socket) => () => {
  console.log("Send Groups list to", socket.id);
  const groupsList = getGroups();
  socket.emit("groupsList", groupsList);
};

// Create new group
exports.createGroupHandler = (io, socket) => (data) => {
  const { groupName, members } = data;
  const creator = invertUsers[socket.id];
  const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log("Create group:", groupName, "by", creator);
  
  const newGroup = {
    id: groupId,
    name: groupName,
    members: [creator, ...members],
    creator: creator,
    createdAt: new Date().toISOString()
  };
  
  // Save to database
  addGroup(newGroup);
  
  // Broadcast updated groups list to all clients
  const groupsList = getGroups();
  io.emit("groupsList", groupsList);
  socket.emit("groupCreated", { groupId, groupName });
};

// Get message history from database
exports.getMessageHistoryHandler = (socket) => (data) => {
  try {
    const { messageType, recipientId, groupId } = data;
    const username = invertUsers[socket.id];
    
    const messages = getMessagesByType(messageType, recipientId, groupId, username);
    
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
  
  // Save to MongoDB
  try {
    await addMessage({
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

// Typing indicator handler
exports.typingHandler = (io, socket) => (data) => {
  const username = invertUsers[socket.id];
  const { chatType, recipientId, groupId, isTyping } = data;
  
  if (chatType === 'private' && recipientId) {
    const toId = users[recipientId];
    if (toId) {
      io.to(toId).emit("userTyping", {
        username,
        chatType,
        isTyping
      });
    }
  } else if (chatType === 'group' && groupId) {
    io.emit("userTyping", {
      username,
      chatType,
      groupId,
      isTyping
    });
  } else if (chatType === 'global') {
    socket.broadcast.emit("userTyping", {
      username,
      chatType,
      isTyping
    });
  }
};

// User online status handler
exports.userStatusHandler = (io, socket) => (data) => {
  const username = invertUsers[socket.id];
  const { status } = data; // 'online', 'away', 'busy'
  
  io.emit("userStatus", {
    username,
    status,
    timestamp: new Date().toISOString()
  });
};

// Message read receipt handler
exports.messageReadHandler = (io, socket) => (data) => {
  const username = invertUsers[socket.id];
  const { messageId, chatType, recipientId } = data;
  
  if (chatType === 'private' && recipientId) {
    const toId = users[recipientId];
    if (toId) {
      io.to(toId).emit("messageRead", {
        messageId,
        readBy: username,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Handle logout (when user clicks BYE)
exports.logoutHandler = (io, socket) => () => {
  console.log("User logout:", socket.id);
  const username = invertUsers[socket.id];
  if (username) {
    try {
      // Remove user from database
      removeUser(username);
      console.log(`Logged out ${username} from database`);
      
      // Notify others that user went offline
      io.emit("userOffline", {
        username,
        timestamp: new Date().toISOString()
      });
      
      // Remove from in-memory cache
      delete users[username];
      delete invertUsers[socket.id];
      
      // Broadcast updated user list from database
      const onlineUsers = getOnlineUsers();
      const usersList = onlineUsers.map(user => ({
        name: user.username,
        avatar: user.avatar
      }));
      io.emit("usersList", usersList);
      
      // Confirm logout to client
      socket.emit("logoutSuccess");
    } catch (error) {
      console.error("Error handling logout:", error);
    }
  }
};

// Handle disconnect (when connection is lost)
exports.disconnectHandler = (io, socket) => () => {
  console.log("Client disconnected:", socket.id);
  const username = invertUsers[socket.id];
  if (username) {
    try {
      // Remove user from database
      removeUser(username);
      console.log(`Removed ${username} from database (disconnect)`);
      
      // Notify others that user went offline
      io.emit("userOffline", {
        username,
        timestamp: new Date().toISOString()
      });
      
      // Remove from in-memory cache
      delete users[username];
      delete invertUsers[socket.id];
      
      // Broadcast updated user list from database
      const onlineUsers = getOnlineUsers();
      const usersList = onlineUsers.map(user => ({
        name: user.username,
        avatar: user.avatar
      }));
      io.emit("usersList", usersList);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  }
};
