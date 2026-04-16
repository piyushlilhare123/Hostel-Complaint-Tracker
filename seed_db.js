import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
    try {
        console.log('🔄 Syncing database (clearing old data)...');
        await sequelize.query('PRAGMA foreign_keys = OFF');
        await sequelize.sync({ force: true });
        await sequelize.query('PRAGMA foreign_keys = ON');
        console.log('✅ Database cleared and synced.');

        console.log('🌱 Seeding Users...');

        // Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'Admin'
        });

        // Students
        const student1 = await User.create({
            name: 'John Doe',
            email: 'student@example.com',
            password: 'password123',
            role: 'Student',
            hostelBlock: 'A',
            roomNumber: '101'
        });

        const student2 = await User.create({
            name: 'Jane Smith',
            email: 'student2@example.com',
            password: 'password123',
            role: 'Student',
            hostelBlock: 'B',
            roomNumber: '202'
        });

        // Staff
        const staffElec = await User.create({
            name: 'Mike Electrician',
            email: 'staff.elec@example.com',
            password: 'password123',
            role: 'Staff',
            domain: 'Electrical'
        });

        const staffPlumb = await User.create({
            name: 'Mario Plumber',
            email: 'staff.plumb@example.com',
            password: 'password123',
            role: 'Staff',
            domain: 'Plumbing'
        });

        console.log('✅ Users seeded.');

        console.log('🌱 Seeding Complaints...');

        // Complaints for Student 1
        await Complaint.create({
            title: 'Fan not working',
            description: 'The ceiling fan in my room is making a loud noise and moving very slowly.',
            category: 'Electrical',
            priority: 'Medium',
            status: 'Pending',
            userId: student1.id
        });

        await Complaint.create({
            title: 'Leaking tap',
            description: 'The tap in the bathroom is dripping constantly.',
            category: 'Plumbing',
            priority: 'Low',
            status: 'Pending',
            userId: student1.id
        });

        // Complaints for Student 2
        await Complaint.create({
            title: 'No power in socket',
            description: 'The wall socket near my desk is not working.',
            category: 'Electrical',
            priority: 'High',
            status: 'In Progress',
            userId: student2.id,
            assignedTo: staffElec.id
        });

        await Complaint.create({
            title: 'Broken window latch',
            description: 'The window latch is broken and cannot be locked.',
            category: 'Carpentry',
            priority: 'Medium',
            status: 'Resolved',
            userId: student2.id,
            assignedTo: null // Assuming resolved by external or unassigned for now, or could assign to admin/staff
        });

        // A rejected complaint
        await Complaint.create({
            title: 'Internet slow',
            description: 'The wifi speed is very slow today.',
            category: 'Internet',
            priority: 'Low',
            status: 'Rejected',
            userId: student1.id,
            rejectedBy: [staffElec.id] // Rejected by electrician
        });

        console.log('✅ Complaints seeded.');
        console.log('🚀 Database refresh complete!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
