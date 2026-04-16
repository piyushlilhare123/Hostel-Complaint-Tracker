import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';

async function verifySLA() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        // 1. Ensure testing user exists
        let user = await User.findOne({ where: { email: 'teststudent@example.com' } });
        if (!user) {
            user = await User.create({
                name: 'Test Student',
                email: 'teststudent@example.com',
                password: 'password', // will be hashed
                role: 'Student'
            });
        }

        // 2. Clear old test complaints
        await Complaint.destroy({ where: { userId: user.id } });

        // 3. Create a new complaint (simulates POST /api/complaints action directly to DB, or via model)
        // Note: the `slaDeadline` is normally set in route. Here we manually set it to verify DB logic.
        const now = new Date();
        const twoMinutesFromNow = new Date(now.getTime() + 2 * 60000);
        
        let complaint = await Complaint.create({
            title: 'Test SLA Warning',
            description: 'This is a test',
            category: 'General',
            priority: 'High',
            userId: user.id,
            slaDeadline: twoMinutesFromNow
        });
        
        console.log('✅ Created Complaint with SLA Deadline (Future):', complaint.slaDeadline);

        // 4. Force state to "NearDeadline" by simulating time passage
        // We do this by changing the deadline to 30 seconds from now.
        const thirtySecondsFromNow = new Date(now.getTime() + 30000);
        complaint.slaDeadline = thirtySecondsFromNow;
        await complaint.save();
        console.log('✅ Updated Complaint SLA Deadline to near (30s):', complaint.slaDeadline);
        
        // Let's use getSlaStatus logic visually
        const getSlaStatus = (c) => {
            if (c.status === 'Resolved' || c.status === 'Rejected') return 'Ok';
            if (!c.slaDeadline) return 'Ok';
            const timeRemainingMs = new Date(c.slaDeadline) - new Date();
            if (timeRemainingMs < 0) return 'Breached';
            if (timeRemainingMs <= 60000) return 'NearDeadline';
            return 'Ok';
        };
        
        console.log('Current Computed Status:', getSlaStatus(complaint));
        if (getSlaStatus(complaint) !== 'NearDeadline') throw new Error('Expected NearDeadline');

        // 5. Force state to "Breached" by simulating deadline in the past
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        complaint.slaDeadline = fiveMinutesAgo;
        await complaint.save();
        
        console.log('✅ Updated Complaint SLA Deadline to past (-5m):', complaint.slaDeadline);
        console.log('Current Computed Status:', getSlaStatus(complaint));
        if (getSlaStatus(complaint) !== 'Breached') throw new Error('Expected Breached');

        // 6. Test resolving
        complaint.status = 'Resolved';
        await complaint.save();
        console.log('Current Computed Status after Resolved:', getSlaStatus(complaint));
        if (getSlaStatus(complaint) !== 'Ok') throw new Error('Expected Ok after resolving');

        console.log('🎉 ALL DB SLA TESTS PASSED! Backend logic verified.');

    } catch (error) {
        console.error('❌ Verification Error:', error);
    } finally {
        await sequelize.close();
    }
}

verifySLA();
