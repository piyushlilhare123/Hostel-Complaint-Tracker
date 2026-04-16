import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// SLA Configuration
const SLA_MODE = process.env.SLA_MODE || 'testing';

export const startSlaChecker = () => {
    // Run every 10 seconds in testing, or every minute in production
    const interval = SLA_MODE === 'testing' ? 10 * 1000 : 60 * 1000;
    
    console.log(`[SLA Checker] Started. Running every ${interval}ms`);

    setInterval(async () => {
        try {
            const activeComplaints = await Complaint.findAll({
                where: {
                    status: ['Pending', 'In Progress']
                }
            });

            const now = new Date();

            for (const complaint of activeComplaints) {
                if (!complaint.slaDeadline) continue;

                const deadline = new Date(complaint.slaDeadline);
                const timeRemainingMs = deadline - now;
                const warningThresholdMs = SLA_MODE === 'testing' ? 60000 : 4 * 60 * 60000;

                // 1. Check for Breach
                if (timeRemainingMs < 0) {
                    // Alert Admins
                    await generateEscalationAlerts(complaint);
                } 
                // 2. Check for Near Deadline Warning
                else if (timeRemainingMs <= warningThresholdMs) {
                    if (complaint.assignedTo) {
                        // Alert Assigned Staff
                        await generateWarningAlert(complaint);
                    }
                }
            }
        } catch (error) {
            console.error('[SLA Checker] Error checking SLAs:', error);
        }
    }, interval);
};

async function generateEscalationAlerts(complaint) {
    // Escalate to all Admins
    const admins = await User.findAll({ where: { role: 'Admin' } });
    
    for (const admin of admins) {
        // Prevent duplicate spam
        const existing = await Notification.findOne({
            where: {
                userId: admin.id,
                complaintId: complaint.id,
                type: 'Breach'
            }
        });

        if (!existing) {
            await Notification.create({
                userId: admin.id,
                complaintId: complaint.id,
                type: 'Breach',
                message: `SLA BREACHED: Complaint #${complaint.id} (${complaint.priority} Priority) has exceeded its deadline.`
            });
            console.log(`[SLA Checker] Escalation alert created for Admin ${admin.id} on Complaint #${complaint.id}`);
        }
    }
}

async function generateWarningAlert(complaint) {
    // Prevent duplicate spam
    const existing = await Notification.findOne({
        where: {
            userId: complaint.assignedTo,
            complaintId: complaint.id,
            type: 'Warning'
        }
    });

    if (!existing) {
        await Notification.create({
            userId: complaint.assignedTo,
            complaintId: complaint.id,
            type: 'Warning',
            message: `SLA WARNING: You have less than ${process.env.SLA_MODE === 'testing' ? '1 minute' : '4 hours'} to resolve Complaint #${complaint.id}.`
        });
        console.log(`[SLA Checker] Warning alert created for Staff ${complaint.assignedTo} on Complaint #${complaint.id}`);
    }
}
