var express = require('express');
var route = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Membership = require('membership');
var memb = new Membership('membership');

passport.use(new LocalStrategy(
  function(email, password, done) {
    var memb = new Membership('membership');
    memb.authenticate(email, password, function(err, authResult) {
        if(authResult.success) {
            done(null, authResult.user);
        } else {
            done(null, false, {message: authResult.message});
        }
    });

    // User.findOne({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.authenticationToken);
});

passport.deserializeUser(function(token, done) {
    memb.findUserByToken(token, done);
});

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('double secret probation'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

require('./routes/account')(app);



