const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Official = require('../models/Official');

// Home page
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 })
            .limit(3)
            .populate('createdBy', 'name');
        const officials = await Official.find({ isActive: true })
            .sort({ order: 1 })
            .limit(4);
        res.render('index', {
            title: 'KeMUMSA - Home',
            events: events,
            officials: officials
        });
    } catch (err) {
        console.error(err);
        res.render('index', {
            title: 'KeMUMSA - Home',
            events: [],
            officials: []
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About KeMUMSA'
    });
});

// Officials page
router.get('/officials', async (req, res) => {
    try {
        const officials = await Official.find({ isActive: true })
            .sort({ order: 1 });
        res.render('officials', {
            title: 'Our Officials',
            officials: officials
        });
    } catch (err) {
        console.error(err);
        res.render('officials', {
            title: 'Our Officials',
            officials: []
        });
    }
});

module.exports = router;
