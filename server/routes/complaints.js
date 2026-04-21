import express from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import Notification from '../models/Notification.js';

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// SLA Configuration
const SLA_MODE = process.env.SLA_MODE || 'testing'; // 'testing' or 'production'

const getSLaDeadline = (priority) => {
    const now = new Date();
    if (SLA_MODE === 'testing') {
        // High: 2 mins, Medium: 4 mins, Low: 6 mins
        const minutes = priority === 'High' ? 2 : priority === 'Medium' ? 4 : 6;
        return new Date(now.getTime() + minutes * 60000);
    } else {
        // High: 24 hours, Medium: 48 hours, Low: 72 hours
        const hours = priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72;
        return new Date(now.getTime() + hours * 60 * 60000);
    }
};

const getSlaStatus = (complaint) => {
    if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
        return 'Ok';
    }
    if (!complaint.slaDeadline) return 'Ok';

    const now = new Date();
    const deadline = new Date(complaint.slaDeadline);
    const timeRemainingMs = deadline - now;

    if (timeRemainingMs < 0) {
        return 'Breached';
    }
    
    // Near deadline if < 1 min in testing, or < 4 hours in prod
    const warningThresholdMs = SLA_MODE === 'testing' ? 60000 : 4 * 60 * 60000;
    if (timeRemainingMs <= warningThresholdMs) {
        return 'NearDeadline';
    }
    
    return 'Ok';
};

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

// Create a new complaint
router.post('/', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        
        console.log('[DEBUG] Received complaint submission');
        console.log('[DEBUG] Body:', req.body);
        console.log('[DEBUG] Files:', req.files);

        // Get file paths if they exist
        const imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
        const videoUrl = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        console.log('[DEBUG] Attempting to create complaint with imageUrl:', imageUrl, 'and videoUrl:', videoUrl);

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority,
            userId: req.user.id,
            imageUrl,
            videoUrl
            // slaDeadline is explicitly omitted here so it defaults to null until assigned
        });
        
        // Notify all Admins immediately about the new complaint
        try {
            const admins = await User.findAll({ where: { role: 'Admin' } });
            const notifications = admins.map(admin => ({
                message: `New ${priority} Priority Complaint: ${title}`,
                userId: admin.id,
                type: 'NewComplaint',
                complaintId: complaint.id,
                isRead: false
            }));
            await Notification.bulkCreate(notifications);
        } catch (notifErr) {
            console.error('[DEBUG ERROR] Failed to create Admin notifications:', notifErr);
        }
        
        console.log('[DEBUG] Complaint created successfully:', complaint.id);
        res.status(201).json(complaint);
    } catch (error) {
        console.error('[DEBUG ERROR] Full error creating complaint:', error);
        res.status(500).json({ message: 'Error creating complaint', error: error.message });
    }
});

// Get all complaints (Admin/Staff see all, Student sees own)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'Student') {
            whereClause = { userId: req.user.id };
        } else if (req.user.role === 'Staff') {
            whereClause = { assignedTo: req.user.id };
        }

        const complaints = await Complaint.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'role', 'hostelBlock', 'roomNumber'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
        });

        // Add virtual slaStatus
        const complaintsWithSla = complaints.map(c => {
            const complaintData = c.toJSON();
            complaintData.slaStatus = getSlaStatus(complaintData);
            return complaintData;
        });

        res.json(complaintsWithSla);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
});

// Update complaint status (Admin/Staff only)
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const { status, priority, assignedTo, slaHours } = req.body;
        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // IMPORTANT: Allow Students to REOPEN or RATE a resolved complaint
        // IMPORTANT: Allow Students to RESOLVE, REOPEN or RATE their own complaint
        if (req.user.role === 'Student') {
            const { rating } = req.body;
            if (String(complaint.userId) === String(req.user.id)) {
                // Case 1: Student wants to mark as Resolved
                if (status === 'Resolved') {
                    complaint.status = 'Resolved';
                    await complaint.save();
                    return res.json(complaint);
                }

                // Case 2: Actions on already Resolved complaints (Reopen or Rate)
                if (complaint.status === 'Resolved') {
                    if (status === 'Pending') {
                        complaint.status = 'Pending';
                        complaint.assignedTo = null; 
                        complaint.slaDeadline = null;
                        complaint.rating = null; // Reset rating so student can rate again after re-resolution
                        complaint.changed('rating', true); // Force Sequelize to detect null change
                        
                        try {
                            const admins = await User.findAll({ where: { role: 'Admin' } });
                            const notifications = admins.map(a => ({
                                message: `Student reopened complaint: ${complaint.title}`,
                                userId: a.id,
                                type: 'NewComplaint', 
                                complaintId: complaint.id,
                                isRead: false
                            }));
                            await Notification.bulkCreate(notifications);
                        } catch(err) { console.error('Failed to notify admins of reopen', err); }

                        await complaint.save();
                        return res.json(complaint);
                    } else if (rating !== undefined) {
                        const numRating = parseInt(rating, 10);
                        if (numRating >= 1 && numRating <= 5) {
                            complaint.rating = numRating;
                            await complaint.save();
                            return res.json(complaint);
                        } else {
                            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
                        }
                    }
                }
            }
            return res.status(403).json({ message: 'Access denied. Students can only update their own complaints.' });
        }

        // STRICT CHECK: Staff can only update if assigned to them and cannot set to 'Resolved'
        if (req.user.role === 'Staff') {
            if (complaint.assignedTo !== req.user.id) {
                return res.status(403).json({ message: 'Access denied: You can only update complaints assigned to you.' });
            }
            if (status === 'Resolved') {
                return res.status(403).json({ message: 'Access denied: Staff cannot mark complaints as Resolved. This must be done by the student.' });
            }
        }

        if (status) complaint.status = status;
        if (priority && priority !== complaint.priority) {
            complaint.priority = priority;
            // NOTE: We no longer auto-recalculate deadline here. 
            // If an active SLA exists and priority changes, it retains its deadline unless 
            // the admin re-assigns it with a new SLA.
        }

        // Handle Assignment Updates & Custom SLAs
        if (assignedTo !== undefined) {
            // Logic for Staff Rejection
            if (req.user.role === 'Staff' && assignedTo === null) {
                // If staff is unassigning themselves, it counts as a REJECTION
                console.log('[DEBUG] Rejection Logic Start');
                let rejectedList = complaint.rejectedBy || [];
                console.log('[DEBUG] Initial rejectedList:', rejectedList);

                if (!rejectedList.includes(req.user.id)) {
                    console.log('[DEBUG] Adding user ID:', req.user.id);
                    rejectedList.push(req.user.id);
                } else {
                    console.log('[DEBUG] User ID already in list');
                }

                // Explicitly set to trigger the setter
                complaint.rejectedBy = rejectedList;
                console.log('[DEBUG] Set complaint.rejectedBy to:', complaint.rejectedBy);
                complaint.changed('rejectedBy', true);

                complaint.assignedTo = null;
                complaint.status = 'Pending';
                // Important: Suspend the SLA timer upon staff rejection
                complaint.slaDeadline = null; 
                console.log('[DEBUG] About to save...');
            } else {
                // Admin assignment or normal updates
                
                // Admin MUST provide a valid SLA hour timeframe when assigning to actual staff
                if (req.user.role === 'Admin' && assignedTo !== null) {
                    if (slaHours === undefined || isNaN(slaHours)) {
                         return res.status(400).json({ message: 'Missing or invalid SLA Hours. You must specify resolution time.' });
                    }
                    
                    const hours = parseFloat(slaHours);
                    const prio = complaint.priority;

                    // Priority based validation constraints
                    if (prio === 'High' && (hours <= 0 || hours > 24)) {
                        return res.status(400).json({ message: 'High priority SLA must be between 0 and 24 hours.' });
                    }
                    if (prio === 'Medium' && (hours < 24 || hours > 48)) {
                        return res.status(400).json({ message: 'Medium priority SLA must be between 24 and 48 hours.' });
                    }
                    if (prio === 'Low' && (hours < 48 || hours > 72)) {
                        return res.status(400).json({ message: 'Low priority SLA must be between 48 and 72 hours.' });
                    }

                    // Calculate and set custom deadline
                    const now = new Date();
                    complaint.slaDeadline = new Date(now.getTime() + (hours * 60 * 60 * 1000));
                    
                    if (complaint.assignedTo !== assignedTo) {
                         try {
                            await Notification.create({
                                message: `You have been assigned a new ${complaint.priority} priority complaint: ${complaint.title}. SLA Resolution required in ${hours} hours.`,
                                userId: assignedTo,
                                type: 'Assignment',
                                complaintId: complaint.id,
                                isRead: false
                            });
                         } catch(err) { console.error('Could not create notification:', err); }
                    }
                }

                complaint.assignedTo = assignedTo;
                // Force status to Pending when assigning to a new staff member (or reassigning)
                // This ensures the new staff MUST accept it.
                if (assignedTo !== null) {
                    complaint.status = 'Pending';
                }
            }
        }

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Error updating complaint', error: error.message });
    }
});

// Get Stats for Dashboard
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'Student') {
            whereClause = { userId: req.user.id };
        }

        const total = await Complaint.count({ where: whereClause });
        const pending = await Complaint.count({ where: { ...whereClause, status: 'Pending' } });
        const resolved = await Complaint.count({ where: { ...whereClause, status: 'Resolved' } });
        const active = total - resolved; // Approximate logic for "Active"

        // Calculate SLA specific stats
        const allActiveComplaints = await Complaint.findAll({ 
            where: { ...whereClause, status: ['Pending', 'In Progress'] } 
        });
        
        let slaBreaches = 0;
        let nearDeadline = 0;
        
        allActiveComplaints.forEach(c => {
            const status = getSlaStatus(c);
            if (status === 'Breached') slaBreaches++;
            if (status === 'NearDeadline') nearDeadline++;
        });

        res.json({ total, active, pending, resolved, slaBreaches, nearDeadline });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});


// Delete resolved complaint (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const complaint = await Complaint.findByPk(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        if (complaint.status !== 'Resolved') {
            return res.status(400).json({ message: 'Only resolved complaints can be deleted' });
        }

        await complaint.destroy();
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting complaint', error: error.message });
    }
});


export default router;
