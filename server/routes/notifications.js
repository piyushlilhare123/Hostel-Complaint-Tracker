import express from 'express';
import Notification from '../models/Notification.js';
import Complaint from '../models/Complaint.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Get notifications for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Complaint,
                as: 'complaint',
                attributes: ['id', 'title', 'priority']
            }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        
        if (!notification) return res.status(404).json({ message: 'Not found' });
        
        notification.isRead = true;
        await notification.save();
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking read', error: error.message });
    }
});

// Mark all as read
router.patch('/read-all', authenticateToken, async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all read', error: error.message });
    }
});

export default router;
