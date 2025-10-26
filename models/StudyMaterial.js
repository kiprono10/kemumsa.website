<<<<<<< HEAD
const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgraduate'],
        required: true
    },
    category: {
        type: String,
        enum: ['notes', 'assignments', 'past_papers', 'tutorials', 'guides', 'presentations', 'other'],
        default: 'notes'
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
    views: {
        type: Number,
        default: 0
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
=======
const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgraduate'],
        required: true
    },
    category: {
        type: String,
        enum: ['notes', 'assignments', 'past_papers', 'tutorials', 'guides', 'presentations', 'other'],
        default: 'notes'
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
    views: {
        type: Number,
        default: 0
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
