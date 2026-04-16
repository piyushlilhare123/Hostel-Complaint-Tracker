import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Check, X, RefreshCw, Star } from 'lucide-react';
import SLACountdown from '../components/SLACountdown';

export default function ComplaintsList() {
    const [complaints, setComplaints] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { token, user } = useAuth();

    useEffect(() => {
        const fetchAll = () => {
            fetchComplaints();
            if (user.role === 'Admin') {
                fetchStaff();
            }
        };

        fetchAll();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchAll, 5000);

        return () => clearInterval(interval);
    }, [token, user.role]);

    const fetchStaff = async () => {
        try {
            const response = await fetch('/api/users/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStaffList(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await fetch('/api/complaints', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login'; // Force redirect
                return;
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setComplaints(data);
            } else {
                console.error('[API FAULT] Non-array returned:', data);
                setComplaints([]); 
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setComplaints([]); 
        }
    };

    const handleAssignmentUpdate = async (id, staffId, slaHours = null) => {
        try {
            const payload = { assignedTo: staffId || null };
            if (slaHours !== null) {
                payload.slaHours = slaHours;
            }

            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchComplaints(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to assign complaint.');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
        }
    };

    const handlePriorityUpdate = async (id, newPriority) => {
        try {
            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priority: newPriority })
            });

            if (response.ok) {
                fetchComplaints(); // Refresh list
            }
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchComplaints(); // Refresh list
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
        if (response.ok) {
        }
    };

    const handleAccept = async (id) => {
        await handleStatusUpdate(id, 'In Progress');
    };

    const handleReject = async (id) => {
        await handleAssignmentUpdate(id, null);
    };

    const handleReopen = async (id) => {
        if (!window.confirm('Are you sure you want to reopen this resolved complaint?')) return;

        try {
            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Pending' })
            });

            if (response.ok) {
                fetchComplaints(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error reopening complaint:', error);
        }
    };

    const handleRate = async (id, rating) => {
        try {
            const response = await fetch(`/api/complaints/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating })
            });

            if (response.ok) {
                fetchComplaints();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="lg:ml-72 p-6 lg:p-10 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                    {user.role === 'Student' ? 'My Complaints' : 'All Complaints'}
                </h2>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">#</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Title</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Category</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Priority</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Assigned To</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {complaints.length === 0 ? (
                                    <tr>
                                        <td colSpan={user.role === 'Student' ? "7" : "8"} className="p-8 text-center text-slate-500 dark:text-slate-400">No complaints found.</td>
                                    </tr>
                                ) : (
                                    complaints.map((complaint, index) => (
                                        <tr key={complaint.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">
                                                {complaints.length - index}
                                            </td>
                                            <td className="p-4 align-top font-medium text-slate-800 dark:text-white">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>{complaint.title}</span>
                                                    {user.role !== 'Student' && complaint.slaStatus === 'Breached' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 uppercase tracking-wider border border-red-200 dark:border-red-800 animate-pulse">
                                                            SLA Breached
                                                        </span>
                                                    )}
                                                    {user.role !== 'Student' && complaint.slaStatus === 'NearDeadline' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 uppercase tracking-wider border border-orange-200 dark:border-orange-800 animate-pulse">
                                                            Near Deadline
                                                        </span>
                                                    )}
                                                </div>
                                                {user.role !== 'Student' && complaint.user && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        <span className="font-semibold">{complaint.user.name}</span>
                                                        <span className="ml-1 text-slate-400">
                                                            ({complaint.user.hostelBlock ? `Block ${complaint.user.hostelBlock}` : ''}
                                                            {complaint.user.roomNumber ? `, Room ${complaint.user.roomNumber}` : ''})
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="text-slate-800 dark:text-white font-medium">{complaint.category}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs line-clamp-1" title={complaint.description}>
                                                    {complaint.description}
                                                </div>
                                                {/* Attachments Section */}
                                                {(complaint.imageUrl || complaint.videoUrl) && (
                                                    <div className="mt-2 flex gap-2">
                                                        {complaint.imageUrl && (
                                                            <a 
                                                                href={`http://localhost:5000${complaint.imageUrl}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-100 dark:border-indigo-800"
                                                                title="View Image"
                                                            >
                                                                🖼️ Image
                                                            </a>
                                                        )}
                                                        {complaint.videoUrl && (
                                                            <a 
                                                                href={`http://localhost:5000${complaint.videoUrl}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-xs px-2 py-1 bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 rounded hover:bg-teal-100 dark:hover:bg-teal-900/50 transition border border-teal-100 dark:border-teal-800"
                                                                title="View Video"
                                                            >
                                                                🎥 Video
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                {user.role === 'Admin' ? (
                                                    <select
                                                        value={complaint.priority}
                                                        onChange={(e) => handlePriorityUpdate(complaint.id, e.target.value)}
                                                        className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition
                                                            ${complaint.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                                    'bg-green-50 text-green-600 border-green-200'}`}
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${complaint.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                                                            complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                        {complaint.priority}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-top text-slate-500 dark:text-slate-400 text-sm">
                                                <div>{new Date(complaint.createdAt).toLocaleDateString()}</div>
                                                {complaint.slaDeadline && complaint.status !== 'Resolved' && complaint.status !== 'Rejected' && (
                                                    <div className="mt-1.5 font-medium whitespace-nowrap">
                                                        <span className="text-slate-400 block uppercase tracking-wide text-[9px] mb-0.5">Time Remaining</span>
                                                        <SLACountdown deadline={complaint.slaDeadline} status={complaint.status} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-top text-sm">
                                                {user.role === 'Admin' ? (
                                                    <div className="flex flex-col gap-2 relative">
                                                        <select
                                                            value={complaint.assignedStaff?.id || ''}
                                                            onChange={(e) => {
                                                                const sId = e.target.value;
                                                                if (!sId) {
                                                                    handleAssignmentUpdate(complaint.id, null);
                                                                    return;
                                                                }
                                                                // Prompt the Admin to input SLA time in HH:MM:SS based on priority
                                                                let minH=0, maxH=0;
                                                                if(complaint.priority==='High') { minH=0; maxH=24; }
                                                                else if(complaint.priority==='Medium') { minH=24; maxH=48; }
                                                                else if(complaint.priority==='Low') { minH=48; maxH=72; }
                                                                
                                                                const minFormatted = `${minH === 0 ? '00' : minH}:00:00`;
                                                                const maxFormatted = `${maxH}:00:00`;
                                                                const input = window.prompt(`Assign Staff (${complaint.priority} Priority)\nEnter manual SLA Resolution Time in HH:MM:SS format\n(Allowed range: ${minFormatted} to ${maxFormatted}):`, minFormatted);
                                                                if (input === null) {
                                                                    e.target.value = complaint.assignedStaff?.id || '';
                                                                    return; // Cancelled
                                                                }
                                                                
                                                                const parts = input.trim().split(':');
                                                                let h = parseInt(parts[0] || '0', 10);
                                                                let m = parseInt(parts[1] || '0', 10);
                                                                let s = parseInt(parts[2] || '0', 10);

                                                                if (isNaN(h) || isNaN(m) || isNaN(s) || m < 0 || m >= 60 || s < 0 || s >= 60 || parts.length < 2) {
                                                                    alert('Invalid format. Please use HH:MM:SS (e.g., 24:30:00)');
                                                                    e.target.value = complaint.assignedStaff?.id || '';
                                                                    return;
                                                                }

                                                                const slaHrs = h + (m / 60) + (s / 3600);
                                                                
                                                                // Match Backend Constraints
                                                                if (complaint.priority === 'High' && (slaHrs <= 0 || slaHrs > 24)) {
                                                                    alert('High priority SLA must be strictly between 00:00:01 and 24:00:00.');
                                                                    e.target.value = complaint.assignedStaff?.id || '';
                                                                    return;
                                                                }
                                                                if (complaint.priority === 'Medium' && (slaHrs < 24 || slaHrs > 48)) {
                                                                    alert('Medium priority SLA must be between 24:00:00 and 48:00:00.');
                                                                    e.target.value = complaint.assignedStaff?.id || '';
                                                                    return;
                                                                }
                                                                if (complaint.priority === 'Low' && (slaHrs < 48 || slaHrs > 72)) {
                                                                    alert('Low priority SLA must be between 48:00:00 and 72:00:00.');
                                                                    e.target.value = complaint.assignedStaff?.id || '';
                                                                    return;
                                                                }
                                                                
                                                                handleAssignmentUpdate(complaint.id, sId, slaHrs);
                                                            }}
                                                            className="border border-slate-200 dark:border-slate-700 rounded p-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {staffList
                                                                .filter(staff => {
                                                                    // Check if staff ID is in the rejectedBy list
                                                                    const rejectedList = Array.isArray(complaint.rejectedBy)
                                                                        ? complaint.rejectedBy
                                                                        : (typeof complaint.rejectedBy === 'string' ? JSON.parse(complaint.rejectedBy || '[]') : []);
                                                                    return !rejectedList.includes(staff.id);
                                                                })
                                                                .map(staff => (
                                                                    <option key={staff.id} value={staff.id}>
                                                                        {staff.name} | {staff.domain || 'General'} | Load: {staff.workload || 0}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                        {(() => {
                                                            const rejectedIDs = Array.isArray(complaint.rejectedBy)
                                                                ? complaint.rejectedBy
                                                                : (typeof complaint.rejectedBy === 'string' ? JSON.parse(complaint.rejectedBy || '[]') : []);

                                                            if (rejectedIDs.length > 0) {
                                                                const rejectedNames = rejectedIDs.map(id => {
                                                                    const staff = staffList.find(s => s.id === id);
                                                                    return staff ? staff.name : 'Unknown Staff';
                                                                }).join(', ');

                                                                return (
                                                                    <span className="text-xs text-red-500">
                                                                        Rejected by: {rejectedNames}
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        {complaint.assignedStaff ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{complaint.assignedStaff.name}</span>
                                                                <span className="text-xs text-slate-400">{complaint.assignedStaff.email}</span>
                                                            </div>
                                                        ) : 'Unassigned'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                                {complaint.rating && (
                                                    <div className="mt-2">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Student Rating</span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={13}
                                                                    className={star <= complaint.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                                                                    fill={star <= complaint.rating ? 'currentColor' : 'none'}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{complaint.rating}/5</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                    {user.role === 'Staff' ? (
                                                        complaint.assignedStaff?.id === user.id && complaint.status === 'Pending' ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleAccept(complaint.id)}
                                                                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-full transition"
                                                                    title="Accept Assignment"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(complaint.id)}
                                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition"
                                                                    title="Reject Assignment"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={complaint.status}
                                                                onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                                                className="text-sm border border-slate-200 dark:border-slate-700 rounded p-1 focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                                            >
                                                                <option>Pending</option>
                                                                <option>In Progress</option>
                                                                <option>Resolved</option>
                                                                <option>Rejected</option>
                                                            </select>
                                                        )
                                                    ) : user.role === 'Admin' ? (
                                                        <span className="text-xs text-slate-400 italic">View Only</span>
                                                    ) : (
                                                        <div className="flex flex-col gap-2">
                                                            {/* Student View: Can Reopen and Rate Resolved Complaints */}
                                                            {complaint.status === 'Resolved' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleReopen(complaint.id)}
                                                                        className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 w-max"
                                                                    >
                                                                        <RefreshCw size={14} /> Reopen
                                                                    </button>

                                                                    <div className="mt-1">
                                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                                                            {complaint.rating ? 'Your Rating:' : 'Rate Resolution:'}
                                                                        </span>
                                                                        <div className="flex gap-1">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <button
                                                                                    key={star}
                                                                                    onClick={() => !complaint.rating && handleRate(complaint.id, star)}
                                                                                    disabled={!!complaint.rating}
                                                                                    className={`p-0.5 transition ${complaint.rating ? 'cursor-default' : 'hover:scale-110 cursor-pointer'} ${star <= (complaint.rating || 0) ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                                                                    title={!complaint.rating ? `Rate ${star} Stars` : ''}
                                                                                >
                                                                                    <Star size={16} fill={star <= (complaint.rating || 0) ? 'currentColor' : 'none'} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {complaint.status !== 'Resolved' && (
                                                                <span className="text-xs text-slate-400 italic">No actions</span>
                                                            )}
                                                        </div>
                                                    )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
