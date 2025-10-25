const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'unsubscribed'],
        default: 'active'
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date,
        default: null
    },
    preferences: {
        academic: { type: Boolean, default: true },
        events: { type: Boolean, default: true },
        general: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true }
    },
    source: {
        type: String,
        enum: ['website', 'event', 'referral', 'admin'],
        default: 'website'
    },
    tags: [{
        type: String
    }],
    lastEmailSent: {
        type: Date,
        default: null
    },
    emailsReceived: {
        type: Number,
        default: 0
    },
    emailsOpened: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
