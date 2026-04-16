
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Profile() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, token, updateUser } = useAuth();

    // Keep fields in sync with user state
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setHostelBlock(user.hostelBlock || 'A');
            setRoomNumber(user.roomNumber || '');
            setDomain(user.domain || '');
        }
    }, [user]);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || 'A');
    const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
    const [domain, setDomain] = useState(user?.domain || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify({
                    name,
                    email,
                    hostelBlock,
                    roomNumber,
                    domain,
                    password: password || undefined
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage('Profile updated successfully!');
            setPassword('');

            // Update local storage and context
            if (data.user) {
                updateUser(data.user);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="lg:ml-72 p-6 lg:p-10 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">My Profile</h2>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-2xl transition-colors duration-300">
                    {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Role</label>
                            <input
                                type="text"
                                value={user?.role}
                                disabled
                                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                required
                            />
                        </div>

                        {/* Hostel Details - Only for Students */}
                        {user?.role === 'Student' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Hostel Block</label>
                                    <select
                                        value={hostelBlock}
                                        onChange={(e) => setHostelBlock(e.target.value)}
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                    >
                                        <option value="A">Block A</option>
                                        <option value="B">Block B</option>
                                        <option value="C">Block C</option>
                                        <option value="D">Block D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Room No.</label>
                                    <input
                                        type="text"
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                        placeholder="101"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Staff Details - Only for Staff */}
                        {user?.role === 'Staff' && (
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Staff Domain / Expertise</label>
                                <select
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                >
                                    <option value="">Select Domain</option>
                                    <optgroup label="Maintenance & Utility">
                                        <option value="Electrician">Electrician</option>
                                        <option value="Plumber">Plumber</option>
                                        <option value="Carpenter">Carpenter</option>
                                    </optgroup>
                                    <optgroup label="Hygiene & Facilities">
                                        <option value="Housekeeping">Housekeeping</option>
                                        <option value="Laundry Staff">Laundry Staff</option>
                                        <option value="Gardener">Gardener</option>
                                    </optgroup>
                                    <optgroup label="Food & Nutrition">
                                        <option value="Mess Manager">Mess Manager</option>
                                        <option value="Canteen Staff">Canteen Staff</option>
                                    </optgroup>
                                    <optgroup label="Administration & Safety">
                                        <option value="Warden">Warden</option>
                                        <option value="Security Guard">Security Guard</option>
                                        <option value="IT Support">IT Support</option>
                                    </optgroup>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">New Password (Optional)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                placeholder="Leave blank to keep current password"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg transition shadow-md"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
