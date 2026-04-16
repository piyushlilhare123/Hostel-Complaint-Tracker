import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function resetDatabase() {
    try {
        console.log('⚠️ RESETTING DATABASE...');
        await sequelize.query('PRAGMA foreign_keys = OFF');
        // Force sync to drop and recreate tables
        await sequelize.sync({ force: true });
        await sequelize.query('PRAGMA foreign_keys = ON');
        console.log('✅ Database reset successfully. All data has been cleared.');
        console.log('ℹ️ You can now register new users via the application.');
    } catch (error) {
        console.error('❌ Error resetting database:', error);
    } finally {
        await sequelize.close();
    }
}

resetDatabase();
