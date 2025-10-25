const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['official', 'minutes', 'report', 'constitution', 'other'],
        default: 'other'
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    fileType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;