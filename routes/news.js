const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Models
const News = require('../models/News');
const User = require('../models/User');

// Configure multer for news image uploads
const newsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/news/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer for news video uploads
const newsVideoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/videos/news/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const newsUpload = multer({
    storage: newsStorage,
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

const newsVideoUpload = multer({
    storage: newsVideoStorage,
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

// Public routes - News listing and viewing
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Get published news articles
        const news = await News.find({ published: true })
            .sort({ publishedDate: -1, date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name');

        const totalNews = await News.countDocuments({ published: true });
        const totalPages = Math.ceil(totalNews / limit);

        res.render('news/index', {
            title: 'News & Announcements',
            news: news,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        res.render('news/index', {
            title: 'News & Announcements',
            news: [],
            currentPage: 1,
            totalPages: 1
        });
    }
});

// Admin routes - News management

// GET /news/new - Show form to add new article
router.get('/new', ensureAdmin, (req, res) => {
    res.render('news/new', {
        title: 'Add New Article'
    });
});

// Public route - View single news article
router.get('/:id', async (req, res) => {
    try {
        // Check if id looks like a valid ObjectId (24 hex chars)
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            req.flash('error_msg', 'Invalid article ID');
            return res.redirect('/news');
        }

        const news = await News.findById(req.params.id)
            .populate('author', 'name')
            .populate('comments.user', 'name');

        if (!news || !news.published) {
            req.flash('error_msg', 'News article not found');
            return res.redirect('/news');
        }

        // Increment view count
        await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.render('news/show', {
            title: news.title,
            news: news
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading news article');
        res.redirect('/news');
    }
});

// Configure multer for both image and video uploads
const newsUploadFields = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === 'image') {
                cb(null, 'public/images/news/');
            } else if (file.fieldname === 'video') {
                cb(null, 'public/videos/news/');
            }
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            if (file.fieldname === 'image') {
                cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
            } else if (file.fieldname === 'video') {
                cb(null, 'news-video-' + uniqueSuffix + path.extname(file.originalname));
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

// POST /news - Create new article
router.post('/', [ensureAdmin, newsUploadFields], async (req, res) => {
    try {
        const { title, content, excerpt, category, featured, published, scheduledDate, tags, authorName, authorRole } = req.body;

        // Validation
        if (!title || !content) {
            req.flash('error_msg', 'Title and content are required');
            return res.redirect('/news/new');
        }

        // Handle image upload if present
        let image = null;
        if (req.files && req.files.image) {
            image = '/images/news/' + req.files.image[0].filename;
        }

        // Handle video upload if present
        let video = null;
        if (req.files && req.files.video) {
            video = '/videos/news/' + req.files.video[0].filename;
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Create news article
        const news = new News({
            title,
            content,
            excerpt: excerpt || content.substring(0, 300),
            category: category || 'general',
            featured: featured === 'on',
            published: published === 'on',
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            publishedDate: published === 'on' ? new Date() : null,
            image,
            video,
            tags: parsedTags,
            author: req.user._id,
            authorName: authorName || null,
            authorRole: authorRole || null
        });

        await news.save();

        req.flash('success_msg', 'News article created successfully');
        res.redirect('/admin/news');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error creating news article');
        res.redirect('/news/new');
    }
});

// GET /news/:id/edit - Show form to edit article
router.get('/:id/edit', ensureAdmin, async (req, res) => {
    try {
        const news = await News.findById(req.params.id).populate('author', 'name');

        if (!news) {
            req.flash('error_msg', 'News article not found');
            return res.redirect('/admin/news');
        }

        res.render('news/edit', {
            title: 'Edit Article',
            news: news
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading news article');
        res.redirect('/admin/news');
    }
});

// PUT /news/:id - Update article
router.put('/:id', [ensureAdmin, newsUploadFields], async (req, res) => {
    try {
        const { title, content, excerpt, category, featured, published, scheduledDate, tags, authorName, authorRole } = req.body;

        // Validation
        if (!title || !content) {
            req.flash('error_msg', 'Title and content are required');
            return res.redirect(`/news/${req.params.id}/edit`);
        }

        const news = await News.findById(req.params.id);

        if (!news) {
            req.flash('error_msg', 'News article not found');
            return res.redirect('/admin/news');
        }

        // Handle image upload if present
        let image = news.image;
        if (req.files && req.files.image) {
            image = '/images/news/' + req.files.image[0].filename;
        }

        // Handle video upload if present
        let video = news.video;
        if (req.files && req.files.video) {
            video = '/videos/news/' + req.files.video[0].filename;
        }

        // Parse tags
        let parsedTags = [];
        if (tags) {
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Update news article
        await News.findByIdAndUpdate(req.params.id, {
            title,
            content,
            excerpt: excerpt || content.substring(0, 300),
            category: category || 'general',
            featured: featured === 'on',
            published: published === 'on',
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            publishedDate: published === 'on' && !news.published ? new Date() : news.publishedDate,
            image,
            video,
            tags: parsedTags,
            authorName: authorName || null,
            authorRole: authorRole || null
        });

        req.flash('success_msg', 'News article updated successfully');
        res.redirect('/admin/news');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating news article');
        res.redirect(`/news/${req.params.id}/edit`);
    }
});

// DELETE /news/:id - Delete article
router.delete('/:id', ensureAdmin, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            req.flash('error_msg', 'News article not found');
            return res.redirect('/admin/news');
        }

        // Optional: Delete image file from filesystem
        // const fs = require('fs');
        // const path = require('path');
        // if (news.image) {
        //     const imagePath = path.join(__dirname, '..', 'public', news.image);
        //     if (fs.existsSync(imagePath)) {
        //         fs.unlinkSync(imagePath);
        //     }
        // }

        await News.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'News article deleted successfully');
        res.redirect('/admin/news');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting news article');
        res.redirect('/admin/news');
    }
});

module.exports = router;
