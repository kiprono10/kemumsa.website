<<<<<<< HEAD
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 300
    },
    category: {
        type: String,
        enum: ['academic', 'events', 'general', 'announcements', 'research'],
        default: 'general'
    },
    featured: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: false
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    publishedDate: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    video: {
        type: String,
        default: null
    },
    tags: [{
        type: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        default: null
    },
    authorRole: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('News', NewsSchema);
=======
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 300
    },
    category: {
        type: String,
        enum: ['academic', 'events', 'general', 'announcements', 'research'],
        default: 'general'
    },
    featured: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: false
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    publishedDate: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    video: {
        type: String,
        default: null
    },
    tags: [{
        type: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        default: null
    },
    authorRole: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('News', NewsSchema);
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
