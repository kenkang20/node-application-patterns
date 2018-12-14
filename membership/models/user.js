const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const utility = require('../lib/utility');

const userSchema = new Schema({
    id: { type: Number },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
    signInCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now },
    currentLoginAt: { type: Date, default: Date.now },
    authenticationToken: { type: String },
    hashedPassword: { type: String, default: null },
});

userSchema.pre("save",function(next) {
    if (!this.authenticationToken)
      this.authenticationToken = utility.randomString(18);
  
    next();
});

module.exports = mongoose.model('User', userSchema);