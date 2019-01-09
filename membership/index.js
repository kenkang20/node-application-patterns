var events = require("events");
var util = require("util");
var Registration = require("./lib/registration");
var Authentication = require("./lib/authentication");
var mongoose = require('mongoose');
var assert = require("assert");
var User = require("../models/user.js");

var Memebership = function(dbName) {
    var self = this;
    events.EventEmitter.call(self);

    self.findUserByToken = function(token, next) {
        db = mongoose.connect('mongodb://localhost:27017/' + dbName);

        User.findOne({authenticationToken: token}, next);
    };

    self.authenticate = function(email, password, next) {
        db = mongoose.connect('mongodb://localhost:27017/' + dbName);

        var auth = new Authentication();

        auth.on("authenticated", function(authResult) {
            self.emit("authenticated", authResult);
        });

        auth.on("not-authenticated", function(authResult) {
            self.emit("not-authenticated", authResult);
        });

        auth.autenticate({email: email, password: password}, next);
    };

    self.register = function(email, password, confirm) {
        db = mongoose.connect('mongodb://localhost:27017/' + dbName);

        var reg = new Registration();

        reg.on("registrated", function(regResult) {
            self.emit("registered", regResult);
        });

        reg.on("not-registered", function(regResult) {
            self.emit("not-registered", regResult)
        });

        reg.applyForMembership({email: email, password: password, confirm: confirm}, next);
    };

    return self;
}

util.inherits(Memebership, events.EventEmitter);

module.exports = Memebership;