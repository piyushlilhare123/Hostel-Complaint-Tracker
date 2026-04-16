import express from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        req.user = user;
        next();
    });
};

// GET Staff Performance Report
router.get('/staff-performance', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { month } = req.query; // Format 'YYYY-MM'
        let dateFilter = {};
        
        if (month) {
            const [yearStr, monthStr] = month.split('-');
            const year = parseInt(yearStr, 10);
            const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed

            const startDate = new Date(year, monthIdx, 1, 0, 0, 0);
            const endDate = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);

            dateFilter = {
                [Op.or]: [
                    { createdAt: { [Op.between]: [startDate, endDate] } },
                    { updatedAt: { [Op.between]: [startDate, endDate] } }
                ]
            };
        }

        // 1. Fetch all Staff users
        const staffUsers = await User.findAll({ where: { role: 'Staff' } });
        
        // 2. Fetch complaints matching the date filter
        const complaints = await Complaint.findAll({ 
            where: {
                ...dateFilter,
                assignedTo: { [Op.ne]: null }
            } 
        });

        // 3. Aggregate Performance Metrics
        const performanceData = staffUsers.map(staff => {
            const staffComplaints = complaints.filter(c => c.assignedTo === staff.id);
            
            const assigned = staffComplaints.length;
            const resolved = staffComplaints.filter(c => c.status === 'Resolved').length;
            const inProgress = staffComplaints.filter(c => c.status === 'In Progress').length;
            const pending = staffComplaints.filter(c => c.status === 'Pending').length;
            
            const accepted = inProgress + resolved;
            const pendingActive = pending + inProgress;

            // Formulas strictly given by user
            const score = (resolved * 2) + (accepted * 1);
            const resolutionRate = assigned > 0 ? Math.round((resolved / assigned) * 100) : 0;

            return {
                id: staff.id,
                name: staff.name,
                category: staff.domain || 'General',
                assigned,
                accepted,
                resolved,
                pending: pendingActive,
                resolutionRate,
                score
            };
        });

        // 5. Staff Ranking System
        performanceData.sort((a, b) => b.score - a.score);
        performanceData.forEach((staff, index) => {
            staff.rank = index + 1;
        });

        res.json(performanceData);
    } catch (error) {
        console.error('Error fetching staff performance:', error);
        res.status(500).json({ message: 'Error fetching staff performance', error: error.message });
    }
});

export default router;
