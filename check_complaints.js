import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function checkComplaints() {
    try {
        const complaints = await Complaint.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        console.log(`Found ${complaints.length} complaints.`);

        complaints.forEach(c => {
            if (!c.user) {
                console.log(`⚠️ Complaint ID ${c.id}: "${c.title}" has NO associated user (UserId: ${c.userId})`);
            } else {
                console.log(`✅ Complaint ID ${c.id}: "${c.title}" filed by ${c.user.name} (${c.user.email})`);
            }
        });

    } catch (error) {
        console.error('❌ Error checking complaints:', error);
    } finally {
        await sequelize.close();
    }
}

checkComplaints();
