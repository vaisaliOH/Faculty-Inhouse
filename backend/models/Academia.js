const mongoose = require('mongoose');

const academiaSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    day: {
        type: String,
        required: true
    },
    dayOrder: {
        type: Number
    }
});

const Academia = mongoose.model('Academia', academiaSchema);
module.exports = Academia;