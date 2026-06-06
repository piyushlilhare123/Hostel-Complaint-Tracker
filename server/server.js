import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import userRoutes from './routes/users.js';
import sequelize from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


app.use(cors());
app.use(express.json());

import fs from 'fs';
app.use((req, res, next) => {
    try {
        const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
        fs.appendFileSync('debug_logs.txt', logLine);
        
        if (req.url === '/api/complaints') {
           fs.appendFileSync('debug_logs.txt', `HEADERS: ${JSON.stringify(req.headers)}\n`);
        }
    } catch(e) {}
    next();
});

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);

import notificationRoutes from './routes/notifications.js';
app.use('/api/notifications', notificationRoutes);

import reportRoutes from './routes/reports.js';
app.use('/api/reports', reportRoutes);

import chatbotRoutes from './routes/chatbot.js';
app.use('/api/hostel-chatbot', chatbotRoutes);


app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
    
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        next();
    }
});

import { startSlaChecker } from './services/slaChecker.js';


sequelize.sync() 
    .then(() => {
        console.log('Database synced successfully');
        startSlaChecker(); 
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
