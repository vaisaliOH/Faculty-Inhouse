const mongoose = require('mongoose');

const timeTableSchema = new mongoose.Schema({
  batch: { type: Number, required: true },
  dayOrder: { type: Number, required: true },
  hour: { type: Number, required: true },
  subjectCode: { type: String, required: true },
});

// This helps the database find timetable slots very quickly
timeTableSchema.index({ batch: 1, dayOrder: 1, hour: 1 });

module.exports = mongoose.model('TimeTable', timeTableSchema);