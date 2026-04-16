import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Get All Users (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'domain', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get All Staff Members (Admin only)
router.get('/staff', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const staff = await User.findAll({
            where: { role: 'Staff' },
            attributes: [
                'id', 'name', 'email', 'domain',
                [
                    User.sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM Complaints
                        WHERE
                            Complaints.assignedTo = User.id
                            AND Complaints.status = 'In Progress'
                    )`),
                    'workload'
                ]
            ],
            order: [['email', 'ASC']],
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error: error.message });
    }
});

// Delete User (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Update Profile (Any authenticated user)
router.patch('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, password, hostelBlock, roomNumber, domain } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (hostelBlock) user.hostelBlock = hostelBlock;
        if (roomNumber) user.roomNumber = roomNumber;
        if (domain) user.domain = domain;
        if (password) {
            // Password hashing is handled by the model hook, but we need to set it
            user.password = password;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostelBlock: user.hostelBlock,
                roomNumber: user.roomNumber,
                domain: user.domain
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

export default router;
