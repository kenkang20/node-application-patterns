var passport = require('passport');

var AccountRoute = function(app) {
    var redirect = {
        successRedirect : '/',
        failureRedirect : '/',
        failureFlash: false
    };

    app.post('/account/login', passport.authenticate('local', redirect));
}


//global auth checker
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        //Return error content: res.jsonp(...) or redirect: res.redirect('/login');
    }
}

app.get('/account', ensureAuthenticated, function(req, res) {
    // Do something with user via req.user
});

module.exports = AccountRoute;