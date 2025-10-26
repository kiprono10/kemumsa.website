const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    amount: {
        value: { type: Number, required: true },
        currency: { type: String, default: 'KES' },
        type: { type: String, enum: ['fixed', 'variable', 'percentage'], default: 'fixed' }
    },
    eligibility: {
        yearOfStudy: [{ type: String }],
        gpa: { type: Number, default: null },
        department: [{ type: String }],
        other: { type: String, default: null }
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    applicationUrl: {
        type: String,
        default: null
    },
    documents: [{
        name: String,
        required: { type: Boolean, default: true }
    }],
    category: {
        type: String,
        enum: ['merit', 'need_based', 'research', 'sports', 'leadership', 'international', 'other'],
        default: 'merit'
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'upcoming'],
        default: 'open'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    accessLevel: {
        type: String,
        enum: ['member', 'approved', 'active'],
        default: 'member'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['applied', 'under_review', 'approved', 'rejected'],
            default: 'applied'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        documents: [{
            name: String,
            url: String
        }]
    }],
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
