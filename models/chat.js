const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    email: String
});

const chatSummarySchema = new mongoose.Schema({
    userInfo: userInfoSchema,
    summary: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatSummary', chatSummarySchema);