import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Complaint from './Complaint.js';

const Notification = sequelize.define('Notification', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('Warning', 'Breach', 'Info', 'Assignment', 'NewComplaint'),
        defaultValue: 'Info',
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    complaintId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Complaint,
            key: 'id',
        },
    }
});

// Associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

Notification.belongsTo(Complaint, { foreignKey: 'complaintId', as: 'complaint' });
Complaint.hasMany(Notification, { foreignKey: 'complaintId', as: 'notifications' });

export default Notification;
