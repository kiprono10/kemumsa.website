<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// User model
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login'
    });
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Register'
    });
});

// Register handle
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('yearOfStudy').notEmpty().withMessage('Year of study is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/register', {
            title: 'Register',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, password, studentId, yearOfStudy } = req.body;

    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.render('auth/register', {
                title: 'Register',
                errors: [{ msg: 'Email already registered' }],
                formData: req.body
            });
        }

        user = new User({
            name,
            email,
            password,
            studentId,
            yearOfStudy
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register', {
            title: 'Register',
            errors: [{ msg: 'Server error. Please try again.' }],
            formData: req.body
        });
    }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error_msg', info.message);
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redirect admins to admin dashboard, members to member dashboard
            if (user.role === 'admin' || user.role === 'super_admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/dashboard');
            }
        });
    })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// User model
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login'
    });
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Register'
    });
});

// Register handle
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('yearOfStudy').notEmpty().withMessage('Year of study is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/register', {
            title: 'Register',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, password, studentId, yearOfStudy } = req.body;

    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.render('auth/register', {
                title: 'Register',
                errors: [{ msg: 'Email already registered' }],
                formData: req.body
            });
        }

        user = new User({
            name,
            email,
            password,
            studentId,
            yearOfStudy
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register', {
            title: 'Register',
            errors: [{ msg: 'Server error. Please try again.' }],
            formData: req.body
        });
    }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error_msg', info.message);
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redirect admins to admin dashboard, members to member dashboard
            if (user.role === 'admin' || user.role === 'super_admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/dashboard');
            }
        });
    })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});

module.exports = router;
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
