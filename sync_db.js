import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function syncDatabase() {
    try {
        console.log('Starting database synchronization...');
        // { alter: true } will attempt to update existing tables to match the models
        // without dropping them, though it has some limitations with SQLite.
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully with { alter: true }');
    } catch (error) {
        console.error('❌ Error syncing database:', error);

        if (error.name === 'SequelizeDatabaseError' && error.message.includes('duplicate column name')) {
            console.log('Detected duplicate column error, trying fallback sync...');
            try {
                await sequelize.sync();
                console.log('✅ Database synced successfully using fallback.');
            } catch (fallbackError) {
                console.error('❌ Fallback sync failed:', fallbackError);
            }
        }
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
