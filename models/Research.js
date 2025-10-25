const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: true
    },
    authors: [{
        name: String,
        affiliation: String,
        isPrimary: { type: Boolean, default: false }
    }],
    keywords: [{
        type: String
    }],
    category: {
        type: String,
        enum: ['thesis', 'dissertation', 'journal_paper', 'conference_paper', 'research_report', 'case_study', 'review_paper', 'other'],
        default: 'other'
    },
    department: {
        type: String,
        required: true
    },
    publicationYear: {
        type: Number,
        required: true
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
    doi: {
        type: String,
        default: null
    },
    journal: {
        type: String,
        default: null
    },
    conference: {
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
    citations: {
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

module.exports = mongoose.model('Research', ResearchSchema);
