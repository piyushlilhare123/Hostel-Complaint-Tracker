import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'server', 'database.sqlite'),
    logging: console.log
});

const alterDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');
        
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN rating INTEGER');
        console.log('Successfully altered Complaints table to add rating column.');
    } catch (error) {
        console.error('Error altering table (it may already exist):', error.message);
    } finally {
        process.exit();
    }
}

alterDb();
