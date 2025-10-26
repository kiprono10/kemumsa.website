<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Models
const Event = require('../models/Event');
const News = require('../models/News');
const Official = require('../models/Official');
const ContactMessage = require('../models/ContactMessage');
const Subscriber = require('../models/Subscriber');
const Newsletter = require('../models/Newsletter');

// Admin Login
router.get('/login', (req, res) => {
    res.render('admin/login', {
        title: 'Admin Login'
    });
});

// Admin Dashboard
router.get('/dashboard', ensureAdmin, async (req, res) => {
    try {
        // Get statistics
        const totalEvents = await Event.countDocuments();
        const totalNews = await News.countDocuments();
        const unreadMessages = await ContactMessage.countDocuments({ read: false });
        const activeSubscribers = await Subscriber.countDocuments({ status: 'active' });
        const pageViews = 3458; // Placeholder - would need analytics integration

        // Upcoming events
        const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(5)
            .populate('createdBy', 'name');

        // Recent users
        const User = require('../models/User');
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

// Contact Messages Routes
router.get('/messages', ensureAdmin, async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ date: -1 })
            .select('name email subject message read date');
        res.render('admin/messages/index', {
            title: 'Contact Messages',
            messages
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading messages');
        res.redirect('/admin/dashboard');
    }
});

// Subscribers Routes
router.get('/subscribers', ensureAdmin, async (req, res) => {
    try {
        const subscribers = await Subscriber.find()
            .sort({ subscribedAt: -1 })
            .select('name email status subscribedAt emailsReceived');
        res.render('admin/subscribers/index', {
            title: 'Newsletter Subscribers',
            subscribers
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading subscribers');
        res.redirect('/admin/dashboard');
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

// Update Profile
router.post('/settings', ensureAdmin, (req, res) => {
    req.upload.single('profileImage')(req, res, async function(err) {
        if (err) {
            console.error('Upload error:', err);
            req.flash('error_msg', err.message || 'Error uploading image');
            return res.redirect('/admin/settings');
        }

        const { name, email, phone, bio, currentPassword, newPassword } = req.body;

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                req.flash('error_msg', 'User not found');
                return res.redirect('/admin/settings');
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                req.flash('error_msg', 'Current password is incorrect');
                return res.redirect('/admin/settings');
            }

            // Check if email is already taken by another user
            if (email !== user.email) {
                const existingUser = await User.findOne({ email: email });
                if (existingUser) {
                    req.flash('error_msg', 'Email is already registered');
                    return res.redirect('/admin/settings');
                }
            }

            // Update user fields
            user.name = name;
            user.email = email;
            user.phone = phone || null;
            user.bio = bio || null;

            // Update password if provided
            if (newPassword && newPassword.length >= 6) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPassword, salt);
            }

            // Handle profile image upload
            if (req.file) {
                user.profileImage = '/images/profile/' + req.file.filename;
            }

            await user.save();

            req.flash('success_msg', 'Profile updated successfully');
            res.redirect('/admin/settings');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error updating profile');
            res.redirect('/admin/settings');
        }
    });
});

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Models
const Event = require('../models/Event');
const News = require('../models/News');
const Official = require('../models/Official');
const ContactMessage = require('../models/ContactMessage');
const Subscriber = require('../models/Subscriber');
const Newsletter = require('../models/Newsletter');

// Admin Dashboard
router.get('/dashboard', ensureAdmin, async (req, res) => {
    try {
        // Get statistics
        const totalEvents = await Event.countDocuments();
        const totalNews = await News.countDocuments();
        const unreadMessages = await ContactMessage.countDocuments({ read: false });
        const activeSubscribers = await Subscriber.countDocuments({ status: 'active' });
        const pageViews = 3458; // Placeholder - would need analytics integration

        // Upcoming events
        const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(5)
            .populate('createdBy', 'name');

        // Recent users
        const User = require('../models/User');
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

// Contact Messages Routes
router.get('/messages', ensureAdmin, async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ date: -1 })
            .select('name email subject message read date');
        res.render('admin/messages/index', {
            title: 'Contact Messages',
            messages
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading messages');
        res.redirect('/admin/dashboard');
    }
});

// Subscribers Routes
router.get('/subscribers', ensureAdmin, async (req, res) => {
    try {
        const subscribers = await Subscriber.find()
            .sort({ subscribedAt: -1 })
            .select('name email status subscribedAt emailsReceived');
        res.render('admin/subscribers/index', {
            title: 'Newsletter Subscribers',
            subscribers
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading subscribers');
        res.redirect('/admin/dashboard');
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

module.exports = router;
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
