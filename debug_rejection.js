import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('--- STARTING REJECTION WORKFLOW TEST ---');

        // 1. Setup Identities
        const users = [
            { name: 'Staff User', email: 'staff_test@example.com', role: 'Staff' },
            { name: 'Admin User', email: 'admin_test@example.com', role: 'Admin' },
            { name: 'Student User', email: 'student_test@example.com', role: 'Student' }
        ];

        const tokens = {};
        const ids = {};

        for (const u of users) {
            console.log(`Logging in ${u.role}...`);
            let res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: u.email, password: 'password123', role: u.role })
            });

            if (res.status !== 200) {
                console.log(`${u.role} login failed, registering...`);
                await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...u, password: 'password123' })
                });
                res = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: u.email, password: 'password123', role: u.role })
                });
            }

            const data = await res.json();
            tokens[u.role] = data.token;
            ids[u.role] = data.user.id;
        }

        console.log('--- Identites Ready ---');

        // 2. Student Creates Complaint
        console.log('1. Student creating complaint...');
        const complaintRes = await fetch(`${BASE_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.Student}`
            },
            body: JSON.stringify({ title: 'Broken Window', description: 'Window in Block A is broken', category: 'Maintenance', priority: 'High' })
        });
        const complaint = await complaintRes.json();
        const complaintId = complaint.id;
        console.log('✅ Complaint Created:', complaintId);

        // 3. Admin Assigns to Staff
        console.log('2. Admin assigning to Staff...');
        const assignRes = await fetch(`${BASE_URL}/complaints/${complaintId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.Admin}`
            },
            body: JSON.stringify({ assignedTo: ids.Staff })
        });
        const assignData = await assignRes.json();
        console.log('✅ Assigned result:', assignData.assignedTo === ids.Staff ? 'SUCCESS' : 'FAILED');

        // 4. Staff Rejects
        console.log('3. Staff rejecting complaint...');
        const rejectRes = await fetch(`${BASE_URL}/complaints/${complaintId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.Staff}`
            },
            body: JSON.stringify({ assignedTo: null })
        });
        const rejectData = await rejectRes.json();
        console.log('✅ Rejection result. Status:', rejectData.status, 'RejectedBy:', rejectData.rejectedBy);

        // 5. Verify Persistence (Admin Check)
        console.log('4. Admin verifying rejection persistence...');
        const viewRes = await fetch(`${BASE_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${tokens.Admin}` }
        });
        const complaints = await viewRes.json();
        const verified = complaints.find(c => c.id === complaintId);

        let rejectedList = verified.rejectedBy || [];
        if (typeof rejectedList === 'string') {
            try { rejectedList = JSON.parse(rejectedList); } catch (e) { rejectedList = []; }
        }

        console.log('--- TEST RESULTS ---');
        console.log('Complaint ID:', complaintId);
        console.log('Final Status:', verified.status);
        console.log('Rejected By IDs:', rejectedList, 'Type:', typeof rejectedList);

        if (Array.isArray(rejectedList) && rejectedList.some(id => String(id) === String(ids.Staff))) {
            console.log('🏆 SUCCESS: Rejection correctly tracked!');
        } else {
            console.log('❌ FAILURE: Rejection data missing or incorrect');
        }

    } catch (error) {
        console.error('💥 TEST CRASHED:', error.message);
    }
}

runTest();
