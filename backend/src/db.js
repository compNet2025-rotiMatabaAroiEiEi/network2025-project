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
    const defaultData = { messages: [] };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  }
  
  console.log('JSON database initialized at:', dbPath);
};

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { messages: [] };
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

module.exports = { initDB, addMessage, getMessages };
