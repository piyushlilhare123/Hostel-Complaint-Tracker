import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Complaint = sequelize.define('Complaint', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General',
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium',
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Rejected'),
        defaultValue: 'Pending',
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    rejectedBy: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('rejectedBy');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('rejectedBy', JSON.stringify(value || []));
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    slaDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },
});

// Associations
Complaint.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Complaint, { foreignKey: 'userId', as: 'complaints' });

Complaint.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedStaff' });
User.hasMany(Complaint, { foreignKey: 'assignedTo', as: 'assignedComplaints' });

export default Complaint;
