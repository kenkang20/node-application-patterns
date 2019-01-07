var Registration = require("../lib/registration");
var assert = require("assert");
var Auth = require("../lib/authentication");
var User = require("../models/user.js");
var should = require("should");
var mongoose = require('mongoose');

describe("Authentication", function () {
  var db = null;
  var reg = {};
  var auth = {};
  
  before(function(done) {
    db = mongoose.connect('mongodb://localhost:27017/membership');
    reg = new Registration();
    auth = new Auth();

    reg.applyForMembership({
      email : "test@test.com",
      password : "password",
      confirm : "password"}, function(err, regResult){
      assert.ok(regResult.success);
      done();
    });
  });

  describe("a valid login", function () {
    var authResult = {};
    before(function (done) {
      //log them in...
      auth.authenticate({email : "test@test.com", password : "password"}, function(err,result){
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });
    it("is successful", function(){
      authResult.success.should.equal(true);
    });
    it("returns a user", function(){
      should.exist(authResult.user);
    });
    it("creates a log entry", function(){
      should.exist(authResult.log);
    });
    it("updates the user stats", function(){
      authResult.user.signInCount.should.equal(2);
    });
    it("updates the signon dates", function(){
      should.exist(authResult.user.lastLoginAt);
      should.exist(authResult.user.currentLoginAt);
    });

  });

  describe("empty email", function () {
    var authResult = {};
    before(function (done) {
      //log them in...
      auth.authenticate({email : null, password : "password"}, function(err,result){
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns a message saying 'Invalid login'", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("empty password", function () {
    var authResult = {};
    before(function (done) {
      //log them in...
      auth.authenticate({email : "test@test.com", password : null}, function(err,result){
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns a message saying 'Invalid login'", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("password doesn't match", function () {
    var authResult = {};
    before(function (done) {
      //log them in...
      auth.authenticate({email : "test@test.com", password : "gleep"}, function(err,result){
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns a message saying 'Invalid login'", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("email not found", function () {
    var authResult = {};
    before(function (done) {
      //log them in...
      auth.authenticate({email : "xxxxx@test.com", password : null}, function(err,result){
        assert.ok(err === null, err);
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns a message saying 'Invalid login'", function(){
      authResult.message.should.equal("Invalid email or password");
    });

    after(function (done) {
      User.remove().exec();
      done();
    });
  });

});