var User = require("../models/user");
var Application = require("../models/application");
var assert = require("assert");
var bc = require("bcrypt-nodejs");
var Log = require("../models/log");
var Emitter = require("events").EventEmitter;
var util = require("util");

//A wrapper object for our registration call result
var RegResult = function(){
  var result = {
    success : false,
    message : null,
    user : null,
    log: null
  };
  return result;
};

//This is the prototype which we will export
var Registration = function(){
  Emitter.call(this);
  var self = this;
  var continueWith = null;

  self.applyForMembership = function(args, next){
    continueWith = next;
    var app = new Application(args);
    self.emit("application-received",app);
  };

  var validateInputs = function(app){
    //make sure there's an email and password
    if(!app.email || !app.password){
      app.setInvalid("Email and password are required");
      self.emit("invalid",app);
    }else if(app.password !== app.confirm){
      app.setInvalid("Passwords don't match");
      self.emit("invalid",app);
    }else{
      app.validate();
      self.emit("validated",app);
    }

  };

  var checkIfUserExists = function(app){
  
    User.findOne({email : app.email}, function(err, exists){
     
      assert.ok(err === null);
      if(exists){
        app.setInvalid("This email already exists");
        self.emit("invalid",app);
      }else{
        self.emit("user-doesnt-exist",app);
      }
    });
  };

  var createUser = function(app){
    
    var user = new User(app);
    user.status = "approved";
    user.hashedPassword = bc.hashSync(app.password);
    user.signInCount = 1;
    user.save(function(err,newUser){
      
      assert.ok(err === null, err);
      app.user = newUser;  
      self.emit("user-created",app);
    });
  };

  var addLogEntry = function(app){
    
    var log = new Log({
      subject : "Registration",
      userId : app.user._id,
      entry : "Successfully Registered"
    });

    log.save(function(err,newLog){
      app.log = newLog;
      self.emit("log-created",app);
    });
  };

  //the final call if everything works as expected
  var registrationOk = function(app){
    var regResult = new RegResult();
    regResult.success = true;
    regResult.message = "Welcome!";
    regResult.user = app.user;
    regResult.log = app.log;
    
    self.emit("registered", regResult);
    if(continueWith){
      continueWith(null,regResult);
    }
  };

  //the final call if anything fails
  var registrationNotOk = function(app){
    var regResult = new RegResult();
    regResult.success = false;
    regResult.message = app.message;
    self.emit("not-registered", regResult);
    if(continueWith){
      continueWith(null,regResult);
    }
  };

  var registered = function(registrationOk) {

  }

  var notRegisterd = function(registrationOk) {
    
  }

  //The event chain for a successful registration
  self.on("application-received",validateInputs);
  self.on("validated", checkIfUserExists);
  self.on("user-doesnt-exist",createUser);
  self.on("user-created",addLogEntry);
  self.on("log-created",registrationOk);
  self.on("registered",registered);
  self.on("not-registered",notRegisterd);

  //the event chain for a non-successful registration
  self.on("invalid",registrationNotOk);

  return self;
};

util.inherits(Registration, Emitter);
module.exports = Registration;
