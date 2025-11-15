const mongoose = require('mongoose');
const Message = require('./models/Message');
const Group = require('./models/Group');

// Initialize database connection
const initDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/chatapp?authSource=admin';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add message
const addMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Get messages with filter
const getMessages = async (filter) => {
  try {
    let query = {};
    
    // Build MongoDB query from filter function
    // This is a simplified approach - you may need to adjust based on your filter logic
    const messages = await Message.find(query).sort({ timestamp: 1 }).limit(100);
    
    // Apply the filter function if provided
    if (typeof filter === 'function') {
      return messages.filter(filter);
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Get messages by type and participants
const getMessagesByType = async (messageType, recipientId = null, groupId = null, username = null) => {
  try {
    let query = { messageType };
    
    if (messageType === 'private' && recipientId && username) {
      query = {
        messageType: 'private',
        $or: [
          { username: username, recipientId: recipientId },
          { username: recipientId, recipientId: username }
        ]
      };
    } else if (messageType === 'group' && groupId) {
      query.groupId = groupId;
    }
    
    const messages = await Message.find(query).sort({ timestamp: 1 }).limit(100);
    return messages;
  } catch (error) {
    console.error('Error fetching messages by type:', error);
    return [];
  }
};

// Add group
const addGroup = async (groupData) => {
  try {
    const group = new Group(groupData);
    await group.save();
    return group;
  } catch (error) {
    console.error('Error saving group:', error);
    throw error;
  }
};

// Get all groups
const getGroups = async () => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

// Update group
const updateGroup = async (groupId, updatedData) => {
  try {
    const group = await Group.findOneAndUpdate(
      { id: groupId },
      updatedData,
      { new: true }
    );
    return group;
  } catch (error) {
    console.error('Error updating group:', error);
    return null;
  }
};

module.exports = { 
  initDB, 
  addMessage, 
  getMessages,
  getMessagesByType,
  addGroup, 
  getGroups, 
  updateGroup
};
