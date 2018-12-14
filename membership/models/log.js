const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    subject: { type: String },
    entry: { type: String },
    createdAt: { type: Date, default: Date.now },
    userId: { type: String }
});

module.exports = mongoose.model('Log', logSchema);