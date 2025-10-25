const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['member', 'moderator', 'admin', 'super_admin'],
        default: 'member'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'inactive', 'suspended'],
        default: 'pending'
    },
    studentId: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
