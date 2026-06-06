import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, hostelBlock, roomNumber, domain } = req.body;


        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });


        await User.create({ name, email, password, role, hostelBlock, roomNumber, domain });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('[REGISTRATION ERROR DETAILS]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

     
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


        if (role && user.role !== role) {
            return res.status(403).json({ message: 'Role mismatch' });
        }

     
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
