import sequelize from './server/config/database.js';
import User from './server/models/User.js';
import Complaint from './server/models/Complaint.js';
import Notification from './server/models/Notification.js';

async function verifyRealTimeSLA() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

     
        const staff = await User.findOne({ where: { role: 'Staff' } });
        const admin = await User.findOne({ where: { role: 'Admin' } });
        const student = await User.findOne({ where: { role: 'Student' } });

        if (!staff || !admin || !student) {
            console.error('❌ Missing necessary test users. Seed the database first.');
            return;
        }

       
        await Notification.destroy({ where: {} });

      
        const now = new Date();
        const futureDeadline = new Date(now.getTime() + 60000); 
        const complaint = await Complaint.create({
            title: 'Real-Time SLA Test',
            description: 'Testing the background checker',
            category: 'Testing',
            priority: 'High',
            userId: student.id,
            assignedTo: staff.id,
            slaDeadline: futureDeadline,
            status: 'In Progress'
        });

        console.log(`✅ Created test complaint #${complaint.id} with deadline 1 minute from now.`);

        console.log('⏳ Waiting 15 seconds for SLA checker to poll and generate WARNING...');
        await new Promise(r => setTimeout(r, 15000)); 

        const warningNotif = await Notification.findOne({ where: { type: 'Warning', complaintId: complaint.id } });
        if (warningNotif) {
            console.log('✅ SUCCESS: Warning Notification generated for Staff!');
        } else {
            console.log('❌ FAILED: Warning Notification NOT found.');
        }

        
        complaint.slaDeadline = new Date(now.getTime() - 10000); 
        await complaint.save();
        console.log(`✅ Forced breach of test complaint #${complaint.id}.`);

        console.log('⏳ Waiting 15 seconds for SLA checker to poll and generate BREACH...');
        await new Promise(r => setTimeout(r, 15000)); 

        const breachNotif = await Notification.findOne({ where: { type: 'Breach', complaintId: complaint.id } });
        if (breachNotif) {
            console.log('✅ SUCCESS: Escalation Breach Notification generated for Admin!');
        } else {
            console.log('❌ FAILED: Escalation Breach Notification NOT found.');
        }

      
        await complaint.destroy();
        console.log('🎉 REAL-TIME SLA VERIFICATION SCRIPT COMPLETED.');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

verifyRealTimeSLA();
