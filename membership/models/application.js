const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    email: { type: String },
    password: { type: String },
    confirm: { type: String },
    status: { type: String, default: "pending" },
    message: { type: String, default: null },
    user: { type: Object, default: null }
});

applicationSchema.methods.isValid = function(){
    return this.status == "validated";
};
applicationSchema.methods.isInvalid = function(){
    return !this.isValid();
};
applicationSchema.methods.setInvalid = function(message){
    this.status = "invalid";
    this.message = message;
};
applicationSchema.methods.validateData = function(message){
    this.status = "validated";
};

module.exports = mongoose.model('Application', applicationSchema);