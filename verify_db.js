import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function verifyData() {
    try {
        const users = await User.findAll();
        console.log(`✅ Found ${users.length} users.`);
        users.forEach(u => console.log(` - ${u.name} (${u.role}) - ${u.email}`));

        const complaints = await Complaint.findAll();
        console.log(`✅ Found ${complaints.length} complaints.`);
        complaints.forEach(c => console.log(` - ${c.title} [${c.status}] (Assigned to: ${c.assignedTo || 'None'})`));

    } catch (error) {
        console.error('❌ Error verifying data:', error);
    } finally {
        await sequelize.close();
    }
}

verifyData();
