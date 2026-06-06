import sequelize from './server/config/database.js';

async function alterDatabaseForSLA() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

      
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('Complaints', 'slaDeadline', {
            type: sequelize.Sequelize.DATE,
            allowNull: true, 
        });
        
        console.log('Successfully added `slaDeadline` column to Complaints table.');

    } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('duplicate column name')) {
            console.log('Column `slaDeadline` already exists.');
        } else {
            console.error('Unable to connect to the database or alter table:', error);
        }
    } finally {
        await sequelize.close();
    }
}

alterDatabaseForSLA();
