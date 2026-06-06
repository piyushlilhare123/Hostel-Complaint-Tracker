import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'server', 'database.sqlite'),
    logging: console.log,
});

export default sequelize;
