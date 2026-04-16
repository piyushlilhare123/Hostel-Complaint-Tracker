import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'server', 'database.sqlite'),
    logging: console.log
});

const checkDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');
        
        const [results, metadata] = await sequelize.query('SELECT name FROM sqlite_master WHERE type="table"');
        console.log('Tables:', results);

        const [results2] = await sequelize.query('PRAGMA table_info(Complaints)');
        console.log('Columns in Complaints:', results2);
        
        const [results3] = await sequelize.query('SELECT * FROM Complaints');
        console.log('Records:', results3);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkDatabase();
