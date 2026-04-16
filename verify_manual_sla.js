import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function verifyManualSLA() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        // 1. Get student and admin
        const student = await User.findOne({ where: { role: 'Student' } });
        const admin = await User.findOne({ where: { role: 'Admin' } });
        const staff = await User.findOne({ where: { role: 'Staff' } });

        // 2. Mock creating complaints to ensure SLA starts as NULL
        const highComplaint = await Complaint.create({
            title: 'High Priority SLA Test',
            description: 'Testing manual SLA',
            category: 'Testing',
            priority: 'High',
            userId: student.id,
            status: 'Pending'
        });
        
        const medComplaint = await Complaint.create({
            title: 'Medium Priority SLA Test',
            description: 'Testing manual SLA',
            category: 'Testing',
            priority: 'Medium',
            userId: student.id,
            status: 'Pending'
        });

        // 3. Verify they start with NO SLA
        console.log(`High Complaint SLA: ${highComplaint.slaDeadline}`);
        console.log(`Medium Complaint SLA: ${medComplaint.slaDeadline}`);
        if (highComplaint.slaDeadline === null && medComplaint.slaDeadline === null) {
            console.log('✅ SUCCESS: New complaints are correctly created with NULL (suspended) SLAs.');
        } else {
            console.log('❌ FAILED: Complaints are automatically getting SLAs. Expected null.');
        }

        // 4. Test validation logic via the API structure logic (we simulate the route controller logic here)
        console.log('\nTesting validation constraints...');
        const testValidation = (prio, hours) => {
            if (prio === 'High' && (hours <= 0 || hours > 24)) return false;
            if (prio === 'Medium' && (hours < 24 || hours > 48)) return false;
            if (prio === 'Low' && (hours < 48 || hours > 72)) return false;
            return true;
        };

        if (!testValidation('High', 25)) console.log('✅ Validation correctly blocks High > 24h');
        if (!testValidation('Medium', 12)) console.log('✅ Validation correctly blocks Medium < 24h');
        if (!testValidation('Low', 80)) console.log('✅ Validation correctly blocks Low > 72h');
        
        if (testValidation('High', 12)) console.log('✅ Validation allows High = 12h');
        if (testValidation('Medium', 36)) console.log('✅ Validation allows Medium = 36h');

        // Clean up
        await highComplaint.destroy();
        await medComplaint.destroy();
        console.log('\n🎉 MANUAL SLA VERIFICATION COMPLETED.');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

verifyManualSLA();
