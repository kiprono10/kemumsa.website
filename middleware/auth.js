module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },

    forwardAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },

    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'Access denied. Admin privileges required.');
        res.redirect('/');
    }
};
