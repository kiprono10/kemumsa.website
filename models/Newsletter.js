<<<<<<< HEAD
const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent'],
        default: 'draft'
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    sentDate: {
        type: Date,
        default: null
    },
    recipients: [{
        email: String,
        name: String,
        status: {
            type: String,
            enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced'],
            default: 'sent'
        },
        sentAt: Date,
        openedAt: Date,
        clickedAt: Date
    }],
    totalRecipients: {
        type: Number,
        default: 0
    },
    deliveredCount: {
        type: Number,
        default: 0
    },
    openedCount: {
        type: Number,
        default: 0
    },
    clickedCount: {
        type: Number,
        default: 0
    },
    bouncedCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    template: {
        type: String,
        default: 'default'
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
=======
const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent'],
        default: 'draft'
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    sentDate: {
        type: Date,
        default: null
    },
    recipients: [{
        email: String,
        name: String,
        status: {
            type: String,
            enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced'],
            default: 'sent'
        },
        sentAt: Date,
        openedAt: Date,
        clickedAt: Date
    }],
    totalRecipients: {
        type: Number,
        default: 0
    },
    deliveredCount: {
        type: Number,
        default: 0
    },
    openedCount: {
        type: Number,
        default: 0
    },
    clickedCount: {
        type: Number,
        default: 0
    },
    bouncedCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    template: {
        type: String,
        default: 'default'
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
