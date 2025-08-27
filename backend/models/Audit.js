const mongoose = require('mongoose');

// Renamed to auditSchema for clarity
const auditSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  date: { // The API needs the date directly on the audit document
    type: Date,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  roomNumber: { // Changed from 'venues' to 'roomNumber' to store one room per record
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Audit', auditSchema);