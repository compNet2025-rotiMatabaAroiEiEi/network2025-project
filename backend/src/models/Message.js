const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  messageType: {
    type: String,
    enum: ['global', 'private', 'group'],
    required: true
  },
  recipientId: {
    type: String
  },
  groupId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
