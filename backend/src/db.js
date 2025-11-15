const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize database
const initDB = () => {
  ensureDataDir();
  
  if (!fs.existsSync(dbPath)) {
    const defaultData = { messages: [], groups: [], users: [] };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  } else {
    // Ensure all arrays exist in existing database
    const db = readDB();
    let updated = false;
    if (!db.groups) {
      db.groups = [];
      updated = true;
    }
    if (!db.users) {
      db.users = [];
      updated = true;
    }
    if (updated) {
      writeDB(db);
    }
  }
  
  console.log('JSON database initialized at:', dbPath);
};

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(data);
    // Ensure all arrays exist
    if (!parsed.groups) parsed.groups = [];
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (error) {
    console.error('Error reading database:', error);
    return { messages: [], groups: [], users: [] };
  }
};

// Write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
};

// Add message
const addMessage = (message) => {
  const db = readDB();
  db.messages.push(message);
  writeDB(db);
};

// Get messages with filter
const getMessages = (filter) => {
  const db = readDB();
  return db.messages.filter(filter);
};

// Get messages by type
const getMessagesByType = (messageType, recipientId = null, groupId = null, username = null) => {
  const db = readDB();
  
  let messages = db.messages.filter(msg => {
    if (messageType === 'global') {
      return msg.messageType === 'global';
    } else if (messageType === 'private') {
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
  return messages
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-100);
};

// Add group
const addGroup = (group) => {
  const db = readDB();
  db.groups.push(group);
  writeDB(db);
};

// Get all groups
const getGroups = () => {
  const db = readDB();
  return db.groups || [];
};

// Update group
const updateGroup = (groupId, updatedData) => {
  const db = readDB();
  const groupIndex = db.groups.findIndex(g => g.id === groupId);
  if (groupIndex !== -1) {
    db.groups[groupIndex] = { ...db.groups[groupIndex], ...updatedData };
    writeDB(db);
    return db.groups[groupIndex];
  }
  return null;
};

// Add user
const addUser = (userData) => {
  const db = readDB();
  // Check if user exists
  const existingIndex = db.users.findIndex(u => u.username === userData.username);
  if (existingIndex !== -1) {
    // Update existing user
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      ...userData,
      loginAt: new Date().toISOString()
    };
  } else {
    // Add new user
    db.users.push({
      ...userData,
      loginAt: new Date().toISOString(),
      status: 'online'
    });
  }
  writeDB(db);
};

// Get online users
const getOnlineUsers = () => {
  const db = readDB();
  return db.users || [];
};

// Remove user
const removeUser = (username) => {
  const db = readDB();
  db.users = db.users.filter(u => u.username !== username);
  writeDB(db);
  return true;
};

// Check if username is taken
const isUsernameTaken = (username) => {
  const db = readDB();
  return db.users.some(u => u.username === username);
};

module.exports = { 
  initDB, 
  addMessage, 
  getMessages,
  getMessagesByType,
  addGroup, 
  getGroups, 
  updateGroup,
  addUser,
  getOnlineUsers,
  removeUser,
  isUsernameTaken
};
