const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

// ContactMessage model
const ContactMessage = require('../models/ContactMessage');

// Contact page
router.get('/', (req, res) => {
    res.render('contact', {
        title: 'Contact Us'
    });
});

// Handle contact form submission
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact', {
            title: 'Contact Us',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, subject, message } = req.body;

    try {
        // Save to database
        const contactMessage = new ContactMessage({
            name,
            email,
            subject,
            message
        });
        await contactMessage.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@kemumsa.ac.ke',
            subject: `KeMUMSA Contact Form: ${subject}`,
            html: `
                <h3>New Contact Message from KeMUMSA Website</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        req.flash('success_msg', 'Your message has been sent successfully. We will get back to you soon!');
        res.redirect('/contact');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error sending message. Please try again.');
        res.render('contact', {
            title: 'Contact Us',
            formData: req.body
        });
    }
});

// Admin route to view contact messages
router.get('/admin/messages', require('../middleware/auth').ensureAdmin, async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 });
        res.render('admin/messages', {
            title: 'Contact Messages',
            messages: messages
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading messages');
        res.redirect('/');
    }
});

// Mark message as read
router.put('/admin/messages/:id/read', require('../middleware/auth').ensureAdmin, async (req, res) => {
    try {
        await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
