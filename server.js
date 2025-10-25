const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const newsRoutes = require('./routes/news');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kemumsa', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Configure multer for file uploads (no cropping)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/officials/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'official-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Make multer available globally
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'kemumsa-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/contact', contactRoutes);
app.use('/news', newsRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
