const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Event model
const Event = require('../models/Event');
const User = require('../models/User');

// Configure multer for event image uploads
const eventImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/events/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer for event video uploads
const eventVideoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/videos/events/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const eventImageUpload = multer({
    storage: eventImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const eventVideoUpload = multer({
    storage: eventVideoStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    }
});

// Configure multer for both image and video uploads
const eventUploadFields = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === 'image') {
                cb(null, 'public/images/events/');
            } else if (file.fieldname === 'video') {
                cb(null, 'public/videos/events/');
            }
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            if (file.fieldname === 'image') {
                cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
            } else if (file.fieldname === 'video') {
                cb(null, 'event-video-' + uniqueSuffix + path.extname(file.originalname));
            }
        }
    }),
    limits: {
        fileSize: function(req, file) {
            if (file.fieldname === 'image') {
                return 5 * 1024 * 1024; // 5MB for images
            } else if (file.fieldname === 'video') {
                return 50 * 1024 * 1024; // 50MB for videos
            }
        }
    },
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'image' && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type!'), false);
        }
    }
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

// Events page - show all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 })
            .populate('createdBy', 'name');
        res.render('events/index', {
            title: 'Events',
            events: events
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading events');
        res.redirect('/');
    }
});

// Show single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('registeredUsers', 'name email');
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }
        res.render('events/show', {
            title: event.title,
            event: event
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading event');
        res.redirect('/events');
    }
});

// Register for event
router.post('/:id/register', ensureAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }

        // Check if user is already registered
        if (event.registeredUsers.includes(req.user._id)) {
            req.flash('error_msg', 'You are already registered for this event');
            return res.redirect(`/events/${req.params.id}`);
        }

        // Check capacity
        if (event.capacity > 0 && event.registeredUsers.length >= event.capacity) {
            req.flash('error_msg', 'Event is at full capacity');
            return res.redirect(`/events/${req.params.id}`);
        }

        event.registeredUsers.push(req.user._id);
        await event.save();

        req.flash('success_msg', 'Successfully registered for the event');
        res.redirect(`/events/${req.params.id}`);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error registering for event');
        res.redirect(`/events/${req.params.id}`);
    }
});

// Admin routes
// Add new event form
router.get('/admin/new', ensureAdmin, (req, res) => {
    res.render('events/new', {
        title: 'Add New Event'
    });
});

// Create event
router.post('/admin', [ensureAdmin, eventUploadFields], [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').custom((value) => {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
            throw new Error('Please enter a valid date');
        }
        return true;
    }),
    body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('events/new', {
            title: 'Add New Event',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { title, description, date, location, image, category, capacity } = req.body;

    try {
        // Handle image upload if present
        let imagePath = image || null;
        if (req.files && req.files.image) {
            imagePath = '/images/events/' + req.files.image[0].filename;
        }

        // Handle video upload if present
        let videoPath = null;
        if (req.files && req.files.video) {
            videoPath = '/videos/events/' + req.files.video[0].filename;
        }

        const event = new Event({
            title,
            description,
            date,
            location,
            image: imagePath,
            video: videoPath,
            category: category || 'academic',
            capacity: capacity || 0,
            createdBy: req.user._id
        });

        await event.save();
        req.flash('success_msg', 'Event created successfully');
        res.redirect('/events');
    } catch (err) {
        console.error(err);
        res.render('events/new', {
            title: 'Add New Event',
            errors: [{ msg: 'Error creating event' }],
            formData: req.body
        });
    }
});

// Edit event form
router.get('/admin/:id/edit', ensureAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }
        res.render('events/edit', {
            title: 'Edit Event',
            event: event
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading event');
        res.redirect('/events');
    }
});

// Update event
router.put('/admin/:id', [ensureAdmin, eventUploadFields], [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').custom((value) => {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
            throw new Error('Please enter a valid date');
        }
        return true;
    }),
    body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        try {
            const event = await Event.findById(req.params.id);
            return res.render('events/edit', {
                title: 'Edit Event',
                event: event,
                errors: errors.array(),
                formData: req.body
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error loading event');
            return res.redirect('/events');
        }
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }

        const { title, description, date, location, image, category, capacity } = req.body;

        // Handle image upload if present
        let imagePath = image || event.image;
        if (req.files && req.files.image) {
            imagePath = '/images/events/' + req.files.image[0].filename;
        }

        // Handle video upload if present
        let videoPath = event.video;
        if (req.files && req.files.video) {
            videoPath = '/videos/events/' + req.files.video[0].filename;
        }

        event.title = title;
        event.description = description;
        event.date = date;
        event.location = location;
        event.image = imagePath;
        event.video = videoPath;
        event.category = category || event.category;
        event.capacity = capacity || event.capacity;

        await event.save();
        req.flash('success_msg', 'Event updated successfully');
        res.redirect('/events');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating event');
        res.redirect('/events');
    }
});

// Delete event
router.delete('/admin/:id', ensureAdmin, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Event deleted successfully');
        res.redirect('/events');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting event');
        res.redirect('/events');
    }
});

module.exports = router;
