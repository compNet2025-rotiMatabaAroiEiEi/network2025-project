const { addMessage, getMessages, addGroup, getGroups } = require("./db");

const users = {}; // { username: socket.id }
const invertUsers = {}; // { socket.id : username }
const userAvatars = {}; // { username: avatar }

// Register username
exports.registerHandler = (io, socket) => (data) => {
  const name = typeof data === "string" ? data : data.name;
  const avatar = typeof data === "object" ? data.avatar : null;

  console.log("register user:", name, ", id:", socket.id);

  // Check if username is already taken (currently online)
  if (users[name]) {
    socket.emit(
      "registerError",
      "Username is currently in use. Please try again later or choose a different username."
    );
    return;
  }

  // Add to online users
  users[name] = socket.id;
  invertUsers[socket.id] = name;
  if (avatar) {
    userAvatars[name] = avatar;
  }

  socket.emit("registerSuccess", name);
  console.log("Current users:", users);

  // Broadcast updated user list with avatars to all clients
  const usersList = Object.keys(users).map((username) => ({
    name: username,
    avatar: userAvatars[username] || null,
  }));
  io.emit("usersList", usersList);
};

exports.broadcastHandler = (io, socket) => async (data) => {
  const messageData = {
    username: invertUsers[socket.id],
    userId: socket.id,
    avatar: data.avatar,
    messageType: "global",
    contentType: data.contentType,
    content: data.content,
  };
  console.log("this is me", messageData)

  // Save to JSON database
  try {
    addMessage({
      username: messageData.username,
      contentType: messageData.contentType,
      content: messageData.content,
      avatar: messageData.avatar,
      messageType: "global",
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
      userId: socket.id,
      avatar: data.avatar,
      messageType: "private",
      recipientId: data.recipientId,
      contentType: data.contentType,
      content: data.content,
    };

    // Save to JSON database
    try {
      addMessage({
        username: messageData.username,
        contentType: messageData.contentType,
        content: messageData.content,
        avatar: messageData.avatar,
        messageType: "private",
        recipientId: messageData.recipientId,
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
  const usersList = Object.keys(users).map((username) => ({
    name: username,
    avatar: userAvatars[username] || null,
  }));
  socket.emit("usersList", usersList);
};

// Get groups list
exports.getGroupsHandler = (socket) => () => {
  console.log("Send Groups list to", socket.id);
  const groupsList = getGroups();
  socket.emit("groupsList", groupsList);
};

// Get group members
exports.getGroupMembersHandler = (socket) => (data) => {
  const { groupId } = data;
  const groups = getGroups();
  const group = groups.find((g) => g.id === groupId);

  if (group) {
    console.log("Send group members for", groupId, ":", group.members);
    socket.emit("groupMembers", { groupId, members: group.members });
  }
};

// Join group
exports.joinGroupHandler = (io, socket) => (data) => {
  const { groupId } = data;
  const username = invertUsers[socket.id];
  const { updateGroup } = require("./db");

  if (!username) {
    socket.emit("joinGroupError", "User not registered");
    return;
  }

  const groups = getGroups();
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    socket.emit("joinGroupError", "Group not found");
    return;
  }

  // Check if user is already a member
  if (group.members.includes(username)) {
    socket.emit("joinGroupError", "Already a member of this group");
    return;
  }

  // Add user to group
  const updatedMembers = [...group.members, username];
  updateGroup(groupId, { members: updatedMembers });

  console.log(`${username} joined group ${group.name}`);

  // Notify the user
  socket.emit("joinGroupSuccess", { groupId, groupName: group.name });

  // Broadcast updated group members to all clients
  io.emit("groupMembers", { groupId, members: updatedMembers });

  // Broadcast updated groups list
  const groupsList = getGroups();
  io.emit("groupsList", groupsList);
};



// Create new group
exports.createGroupHandler = (io, socket) => (data) => {
  const { groupName } = data;
  const creator = invertUsers[socket.id];
  const groupId = `group_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  console.log("Create group:", groupName, "by", creator);

  const newGroup = {
    id: groupId,
    name: groupName,
    members: [creator],
    creator: creator,
    createdAt: new Date().toISOString(),
  };

  // Save to database
  addGroup(newGroup);

  // Broadcast updated groups list to all clients
  const groupsList = getGroups();
  io.emit("groupsList", groupsList);
};

// Get message history from JSON database
exports.getMessageHistoryHandler = (socket) => (data) => {
  try {
    const { messageType, recipientId, groupId } = data;
    const username = invertUsers[socket.id];

    let messages = getMessages((msg) => {
      if (messageType === "global") {
        return msg.messageType === "global";
      } else if (messageType === "private") {
        // Get messages between current user and recipient
        return (
          msg.messageType === "private" &&
          ((msg.username === username && msg.recipientId === recipientId) ||
            (msg.username === recipientId && msg.recipientId === username))
        );
      } else if (messageType === "group") {
        return msg.messageType === "group" && msg.groupId === groupId;
      }
      return false;
    });

    // Limit to last 100 messages
    messages = messages.slice(-100);

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
    userId: socket.id,
    groupId: data.groupId,
    avatar: data.avatar,
    messageType: "group",
    contentType: data.contentType,
    content: data.content,
  };

  // Save to JSON database
  try {
    addMessage({
      username: messageData.username,
      contentType: messageData.contentType,
      content: messageData.content,
      avatar: messageData.avatar,
      messageType: "group",
      groupId: messageData.groupId,
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
    const usersList = Object.keys(users).map((username) => ({
      name: username,
      avatar: userAvatars[username] || null,
    }));
    io.emit("usersList", usersList);
  }
};
