const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Models
const Event = require('../models/Event');
const News = require('../models/News');
const Official = require('../models/Official');
const ContactMessage = require('../models/ContactMessage');
const Subscriber = require('../models/Subscriber');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');

// Admin Dashboard
router.get('/dashboard', ensureAdmin, async (req, res) => {
    try {
        // Get statistics
        const totalEvents = await Event.countDocuments();
        const totalNews = await News.countDocuments();
        const unreadMessages = 0; // Removed messages functionality
        const activeSubscribers = 0; // Removed subscribers functionality
        const pageViews = 3458; // Placeholder - would need analytics integration

        // Upcoming events
        const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(5)
            .populate('createdBy', 'name');

        // Recent users
        const recentUsers = await User.find()
            .sort({ date: -1 })
            .limit(5)
            .select('name email profileImage date status');

        // Recent activity (simplified)
        const recentActivity = [
            { type: 'event', action: 'Event created: BLS Training', time: '4 hours ago' },
            { type: 'news', action: 'News article published', time: '1 day ago' }
        ];

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: {
                totalEvents,
                totalNews,
                unreadMessages,
                activeSubscribers,
                pageViews
            },
            upcomingEvents,
            recentUsers,
            recentActivity
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
});



// News Management Routes
router.get('/news', ensureAdmin, async (req, res) => {
    try {
        const news = await News.find()
            .sort({ date: -1 })
            .populate('author', 'name')
            .select('title category published featured date views');
        res.render('admin/news/index', {
            title: 'News Management',
            news
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading news');
        res.redirect('/admin/dashboard');
    }
});

// Events Management Routes
router.get('/events', ensureAdmin, async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: -1 })
            .populate('createdBy', 'name')
            .select('title date location capacity registeredUsers');
        res.render('admin/events/index', {
            title: 'Events Management',
            events
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading events');
        res.redirect('/admin/dashboard');
    }
});

// Officials Management Routes
router.get('/officials', ensureAdmin, async (req, res) => {
    try {
        const officials = await Official.find()
            .sort({ order: 1 })
            .populate('createdBy', 'name');
        res.render('admin/officials/index', {
            title: 'Officials Management',
            officials
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading officials');
        res.redirect('/admin/dashboard');
    }
});

// Add new official form
router.get('/officials/new', ensureAdmin, (req, res) => {
    res.render('admin/officials/new', {
        title: 'Add New Official'
    });
});

// Create official
router.post('/officials', ensureAdmin, (req, res) => {
    req.upload.single('image')(req, res, async function(err) {
        if (err) {
            console.error('Upload error:', err);
            req.flash('error_msg', err.message || 'Error uploading image');
            return res.render('admin/officials/new', {
                title: 'Add New Official',
                errors: [{ msg: err.message || 'Error uploading image' }],
                formData: req.body
            });
        }

        const { name, position, department, bio, email, phone, order, linkedin, twitter, facebook, instagram, achievements, termStart, termEnd } = req.body;

        try {
            const officialData = {
                name,
                position,
                department: department || null,
                bio: bio || null,
                email: email || null,
                phone: phone || null,
                order: order || 0,
                socialLinks: {
                    linkedin: linkedin || undefined,
                    twitter: twitter || undefined,
                    facebook: facebook || undefined,
                    instagram: instagram || undefined
                },
                achievements: achievements ? achievements.split('\n').map(a => a.trim()).filter(a => a) : [],
                termStart: termStart || null,
                termEnd: termEnd || null,
                createdBy: req.user._id
            };

            if (req.file) {
                officialData.image = '/images/officials/' + req.file.filename;
            }

            const official = new Official(officialData);
            await official.save();

            req.flash('success_msg', 'Official added successfully');
            res.redirect('/admin/officials');
        } catch (err) {
            console.error(err);
            res.render('admin/officials/new', {
                title: 'Add New Official',
                errors: [{ msg: 'Error creating official' }],
                formData: req.body
            });
        }
    });
});

// Edit official form
router.get('/officials/:id/edit', ensureAdmin, async (req, res) => {
    try {
        const official = await Official.findById(req.params.id);
        if (!official) {
            req.flash('error_msg', 'Official not found');
            return res.redirect('/admin/officials');
        }
        res.render('admin/officials/edit', {
            title: 'Edit Official',
            official: official
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading official');
        res.redirect('/admin/officials');
    }
});

// Update official
router.put('/officials/:id', ensureAdmin, (req, res) => {
    req.upload.single('image')(req, res, async function(err) {
        if (err) {
            console.error('Upload error:', err);
            req.flash('error_msg', err.message || 'Error uploading image');
            return res.redirect('/admin/officials/' + req.params.id + '/edit');
        }

        try {
            const official = await Official.findById(req.params.id);
            if (!official) {
                req.flash('error_msg', 'Official not found');
                return res.redirect('/admin/officials');
            }

            const { name, position, department, bio, email, phone, order, linkedin, twitter, facebook, instagram, achievements, termStart, termEnd } = req.body;

            official.name = name;
            official.position = position;
            official.department = department || null;
            official.bio = bio || null;
            official.email = email || null;
            official.phone = phone || null;
            official.order = order || 0;
            official.socialLinks = {
                linkedin: linkedin || undefined,
                twitter: twitter || undefined,
                facebook: facebook || undefined,
                instagram: instagram || undefined
            };
            official.achievements = achievements ? achievements.split('\n').map(a => a.trim()).filter(a => a) : [];
            official.termStart = termStart || null;
            official.termEnd = termEnd || null;

            if (req.file) {
                official.image = '/images/officials/' + req.file.filename;
            }

            await official.save();

            req.flash('success_msg', 'Official updated successfully');
            res.redirect('/admin/officials');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error updating official');
            res.redirect('/admin/officials');
        }
    });
});

// Delete official
router.delete('/officials/:id', ensureAdmin, async (req, res) => {
    try {
        const official = await Official.findById(req.params.id);
        if (!official) {
            req.flash('error_msg', 'Official not found');
            return res.redirect('/admin/officials');
        }

        // Optional: Delete image file from filesystem
        // const fs = require('fs');
        // const path = require('path');
        // if (official.image) {
        //     const imagePath = path.join(__dirname, '..', 'public', official.image);
        //     if (fs.existsSync(imagePath)) {
        //         fs.unlinkSync(imagePath);
        //     }
        // }

        await Official.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Official deleted successfully');
        res.redirect('/admin/officials');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting official');
        res.redirect('/admin/officials');
    }
});



// Analytics Routes
router.get('/analytics', ensureAdmin, (req, res) => {
    res.render('admin/analytics', {
        title: 'Analytics & Reporting'
    });
});

// Settings Routes
router.get('/settings', ensureAdmin, (req, res) => {
    res.render('admin/settings', {
        title: 'System Settings'
    });
});

// Profile Update Route
router.post('/settings/profile', ensureAdmin, [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('yearOfStudy').notEmpty().withMessage('Year of study is required'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').optional().custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('admin/settings', {
            title: 'System Settings',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, phone, studentId, yearOfStudy, bio, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/admin/settings');
        }

        // If changing password or email, require current password verification
        if ((newPassword || email !== user.email) && !currentPassword) {
            return res.render('admin/settings', {
                title: 'System Settings',
                errors: [{ msg: 'Current password is required to change password or email' }],
                formData: req.body
            });
        }

        // Verify current password if provided
        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('admin/settings', {
                    title: 'System Settings',
                    errors: [{ msg: 'Current password is incorrect' }],
                    formData: req.body
                });
            }
        }

        // Check email uniqueness if changed
        if (email !== user.email) {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res.render('admin/settings', {
                    title: 'System Settings',
                    errors: [{ msg: 'Email is already registered' }],
                    formData: req.body
                });
            }
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.phone = phone || null;
        user.studentId = studentId;
        user.yearOfStudy = yearOfStudy;
        user.bio = bio || null;

        // Update password if provided
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/admin/settings');
    } catch (err) {
        console.error(err);
        res.render('admin/settings', {
            title: 'System Settings',
            errors: [{ msg: 'Error updating profile. Please try again.' }],
            formData: req.body
        });
    }
});

module.exports = router;
