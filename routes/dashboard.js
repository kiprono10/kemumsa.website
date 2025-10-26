const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Models
const Document = require('../models/Document');
const StudyMaterial = require('../models/StudyMaterial');
const Research = require('../models/Research');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');

// Dashboard home
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;

        // Get user's accessible resources based on their status
        const accessLevel = user.status === 'active' ? 'active' : user.status === 'approved' ? 'approved' : 'member';

        // Build access query
        const accessQuery = {
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        };

        // Get statistics
        const totalDocuments = await Document.countDocuments(accessQuery);
        const totalStudyMaterials = await StudyMaterial.countDocuments(accessQuery);
        const totalResearch = await Research.countDocuments(accessQuery);
        const totalScholarships = await Scholarship.countDocuments({
            ...accessQuery,
            applicationDeadline: { $gte: new Date() }
        });

        // Fetch recent resources for display
        const documents = await Document.find(accessQuery).sort({ date: -1 }).limit(5);
        const studyMaterials = await StudyMaterial.find(accessQuery).sort({ date: -1 }).limit(5);
        const research = await Research.find(accessQuery).sort({ date: -1 }).limit(5);
        const scholarships = await Scholarship.find({
            ...accessQuery,
            applicationDeadline: { $gte: new Date() }
        }).sort({ applicationDeadline: 1 }).limit(5);

        // Get upcoming events (public events user can attend)
        const Event = require('../models/Event');
        const upcomingEvents = await Event.find({
            date: { $gte: new Date() },
            isPublic: true
        }).sort({ date: 1 }).limit(5);

        // Recent activity (simplified - would need activity logging in real app)
        const recentActivity = [
            { action: 'New study materials added', time: '2 hours ago', type: 'material' },
            { action: 'Scholarship deadline approaching', time: '1 day ago', type: 'scholarship' },
            { action: 'Research paper published', time: '2 days ago', type: 'research' },
            { action: 'New document uploaded', time: '3 days ago', type: 'document' },
            { action: 'Event registration opened', time: '1 week ago', type: 'event' }
        ];

        // Recent documents for table
        const recentDocuments = await Document.find(accessQuery)
            .sort({ date: -1 })
            .limit(5)
            .select('title category date');

        // Recent study materials for table
        const recentStudyMaterials = await StudyMaterial.find(accessQuery)
            .sort({ date: -1 })
            .limit(5)
            .select('title subject yearOfStudy date');

        // Recent news for dashboard
        const News = require('../models/News');
        const recentNews = await News.find({ isPublished: true })
            .sort({ date: -1 })
            .limit(5)
            .select('title date excerpt content');

        res.render('dashboard/index', {
            title: 'Member Dashboard - KeMUMSA',
            user: user,
            stats: {
                totalDocuments,
                totalStudyMaterials,
                totalResearch,
                totalScholarships,
                totalEvents: upcomingEvents.length // Placeholder
            },
            documents: documents,
            studyMaterials: studyMaterials,
            research: research,
            scholarships: scholarships,
            upcomingEvents: upcomingEvents,
            recentActivity: recentActivity,
            recentDocuments: recentDocuments,
            recentStudyMaterials: recentStudyMaterials,
            recentNews: recentNews
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard/index', {
            title: 'Member Dashboard - KeMUMSA',
            user: req.user,
            stats: {
                totalDocuments: 0,
                totalStudyMaterials: 0,
                totalResearch: 0,
                totalScholarships: 0,
                totalEvents: 0
            },
            documents: [],
            studyMaterials: [],
            research: [],
            scholarships: [],
            upcomingEvents: [],
            recentActivity: [],
            recentDocuments: [],
            recentStudyMaterials: [],
            recentNews: []
        });
    }
});

// Documents page
router.get('/documents', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const accessLevel = user.status === 'active' ? 'active' : user.status === 'approved' ? 'approved' : 'member';

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const documents = await Document.find({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        }).sort({ date: -1 }).skip(skip).limit(limit);

        const totalDocuments = await Document.countDocuments({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        });

        res.render('dashboard/documents', {
            title: 'Documents - KeMUMSA',
            user: user,
            documents: documents,
            currentPage: page,
            totalPages: Math.ceil(totalDocuments / limit)
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard/documents', {
            title: 'Documents - KeMUMSA',
            user: req.user,
            documents: [],
            currentPage: 1,
            totalPages: 1
        });
    }
});

// Study Materials page
router.get('/study-materials', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const accessLevel = user.status === 'active' ? 'active' : user.status === 'approved' ? 'approved' : 'member';

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const studyMaterials = await StudyMaterial.find({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        }).sort({ date: -1 }).skip(skip).limit(limit);

        const totalMaterials = await StudyMaterial.countDocuments({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        });

        res.render('dashboard/study-materials', {
            title: 'Study Materials - KeMUMSA',
            user: user,
            studyMaterials: studyMaterials,
            currentPage: page,
            totalPages: Math.ceil(totalMaterials / limit)
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard/study-materials', {
            title: 'Study Materials - KeMUMSA',
            user: req.user,
            studyMaterials: [],
            currentPage: 1,
            totalPages: 1
        });
    }
});

// Research page
router.get('/research', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const accessLevel = user.status === 'active' ? 'active' : user.status === 'approved' ? 'approved' : 'member';

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const research = await Research.find({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        }).sort({ date: -1 }).skip(skip).limit(limit);

        const totalResearch = await Research.countDocuments({
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        });

        res.render('dashboard/research', {
            title: 'Research - KeMUMSA',
            user: user,
            research: research,
            currentPage: page,
            totalPages: Math.ceil(totalResearch / limit)
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard/research', {
            title: 'Research - KeMUMSA',
            user: req.user,
            research: [],
            currentPage: 1,
            totalPages: 1
        });
    }
});

// Scholarships page
router.get('/scholarships', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const accessLevel = user.status === 'active' ? 'active' : user.status === 'approved' ? 'approved' : 'member';

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        // Build base query
        const baseQuery = {
            $or: [
                { isPublic: true },
                { accessLevel: { $in: ['member', accessLevel] } }
            ]
        };

        // Add search filter if search term exists
        let searchQuery = baseQuery;
        if (search) {
            searchQuery = {
                ...baseQuery,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { provider: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const scholarships = await Scholarship.find(searchQuery)
            .sort({ applicationDeadline: 1 })
            .skip(skip)
            .limit(limit);

        const totalScholarships = await Scholarship.countDocuments(searchQuery);

        res.render('dashboard/scholarships', {
            title: 'Scholarships - KeMUMSA',
            user: user,
            scholarships: scholarships,
            currentPage: page,
            totalPages: Math.ceil(totalScholarships / limit),
            search: search
        });
    } catch (err) {
        console.error(err);
        res.render('dashboard/scholarships', {
            title: 'Scholarships - KeMUMSA',
            user: req.user,
            scholarships: [],
            currentPage: 1,
            totalPages: 1,
            search: req.query.search || ''
        });
    }
});

// Profile page
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('dashboard/profile', {
        title: 'My Profile - KeMUMSA',
        user: req.user
    });
});

// Update profile
router.post('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const { name, phone, bio } = req.body;
        const user = req.user;

        await User.findByIdAndUpdate(user._id, {
            name: name,
            phone: phone,
            bio: bio
        });

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/dashboard/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/dashboard/profile');
    }
});

module.exports = router;
