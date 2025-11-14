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
    const defaultData = { messages: [], groups: [] };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  } else {
    // Ensure groups array exists in existing database
    const db = readDB();
    if (!db.groups) {
      db.groups = [];
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
    // Ensure groups array exists
    if (!parsed.groups) {
      parsed.groups = [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database:', error);
    return { messages: [], groups: [] };
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

module.exports = { 
  initDB, 
  addMessage, 
  getMessages, 
  addGroup, 
  getGroups, 
  updateGroup
};
