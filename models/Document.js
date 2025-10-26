<<<<<<< HEAD
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['constitution', 'policies', 'guidelines', 'forms', 'reports', 'other'],
        default: 'other'
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        default: 0
    },
    fileType: {
        type: String,
        default: null
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    accessLevel: {
        type: String,
        enum: ['member', 'approved', 'active'],
        default: 'member'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
=======
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['constitution', 'policies', 'guidelines', 'forms', 'reports', 'other'],
        default: 'other'
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        default: 0
    },
    fileType: {
        type: String,
        default: null
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    accessLevel: {
        type: String,
        enum: ['member', 'approved', 'active'],
        default: 'member'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
