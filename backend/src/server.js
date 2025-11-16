const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const {Server} = require("socket.io");
const { initDB } = require("./db");
const path = require('path');
const cors = require('cors');
const {uploadAudio, uploadImage} = require("./upload-handler");
const handlers = require("./socket-handler");

dotenv.config({ path: "./config/config.env"});

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const io = new Server(server, { 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  } 
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("register", handlers.registerHandler(io, socket));
  socket.on("broadcast", handlers.broadcastHandler(io, socket));
  socket.on("privateMessage", handlers.privateMessageHandler(io, socket));
  socket.on("groupMessage", handlers.groupMessageHandler(io, socket));
  socket.on("getUsers", handlers.getUsersHandler(socket));
  socket.on("getGroups", handlers.getGroupsHandler(socket));
  socket.on("getGroupMembers", handlers.getGroupMembersHandler(socket));
  socket.on("createGroup", handlers.createGroupHandler(io, socket));
  socket.on("joinGroup", handlers.joinGroupHandler(io, socket));
  socket.on("getMessageHistory", handlers.getMessageHistoryHandler(socket));
  socket.on("disconnect", handlers.disconnectHandler(io, socket));
});

// Serve static files with proper headers
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'audio/webm');
    } else if (filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'audio/ogg');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'audio/mp4');
    }
  }
}));

app.get("/", (req, res) => {
  res.json({ message: "Server is running!", status: "ok" });
});

app.post('/upload-audio', (req, res) => {
  uploadAudio.single('audioFile')(req, res, (err) => {
    if (err) {
      console.error('Audio upload error:', err);
      return res.status(500).json({error: 'Audio upload failed', details: err.message});
    }
    
    if (!req.file){
      return res.status(400).json({error: 'No audio file uploaded.'});
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const fileUrl = `http://${host}/uploads/audio/${req.file.filename}`;
    console.log('Audio uploaded:', fileUrl);
    res.json({url: fileUrl});
  });
});

app.post('/upload-image', (req, res) => {
  uploadImage.single('imageFile')(req, res, (err) => {
    if (err) {
      console.error('Image upload error:', err);
      return res.status(500).json({error: 'Image upload failed', details: err.message});
    }
    
    if (!req.file){
      return res.status(400).json({error: 'No image file uploaded.'});
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const fileUrl = `http://${host}/uploads/images/${req.file.filename}`;
    console.log('Image uploaded:', fileUrl);
    res.json({url: fileUrl});
  });
});

// Initialize database
initDB();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://192.168.1.46:${PORT}`);
});
