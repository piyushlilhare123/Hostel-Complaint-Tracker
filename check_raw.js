import sequelize from './server/config/database.js';
import { QueryTypes } from 'sequelize';

async function checkComplaint(id) {
    try {
        const rows = await sequelize.query(`SELECT id, status, rejectedBy, assignedTo FROM Complaints WHERE id = ${id}`, { type: QueryTypes.SELECT });
        console.log("Raw Database Row:");
        console.table(rows);
        if (rows.length > 0) {
            console.log("rejectedBy raw value:", rows[0].rejectedBy, "Type:", typeof rows[0].rejectedBy);
        }
    } catch (error) {
        console.error("Error checking database:", error);
    } finally {
        await sequelize.close();
    }
}

// Check the last complaint id from previous test logs (e.g. 11)
const lastId = process.argv[2] || 11;
checkComplaint(lastId);
