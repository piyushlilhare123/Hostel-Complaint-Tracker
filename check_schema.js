import sequelize from './server/config/database.js';
import { QueryTypes } from 'sequelize';

async function checkSchema() {
    try {
        console.log("--- Complaints Table Info ---");
        const complaintsInfo = await sequelize.query("PRAGMA table_info(Complaints)", { type: QueryTypes.SELECT });
        console.table(complaintsInfo);

        console.log("\n--- Users Table Info ---");
        const usersInfo = await sequelize.query("PRAGMA table_info(Users)", { type: QueryTypes.SELECT });
        console.table(usersInfo);

        const rejectedByColumn = complaintsInfo.find(col => col.name === 'rejectedBy');
        if (rejectedByColumn) {
            console.log("\n✅ 'rejectedBy' column exists in Complaints!");
        } else {
            console.log("\n❌ 'rejectedBy' column is MISSING in Complaints!");
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
