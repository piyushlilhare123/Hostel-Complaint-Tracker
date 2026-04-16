import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'server', 'database.sqlite'),
    logging: false
});

const cleanup = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query('DROP TABLE IF EXISTS Users_backup');
        console.log('Users_backup table dropped successfully.');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

cleanup();
