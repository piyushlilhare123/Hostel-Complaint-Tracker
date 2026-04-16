import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react';

export default function StaffPerformanceReport() {
    const { token, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [month, setMonth] = useState("");
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/reports/staff-performance?month=${month}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setStaffData(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch performance report", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [month, token]);

    const filteredData = staffData.filter(staff => (staff.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()));
    const topPerformer = filteredData.find(s => s.rank === 1 && s.score > 0);

    const chartData = filteredData.slice(0, 5).map(s => ({
        ...s,
        inProgress: Math.max(0, s.accepted - s.resolved) // Explicitly extract inProgress 
    }));

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    const pieDataMap = {};
    filteredData.forEach(s => {
        if (s.resolved > 0) {
            pieDataMap[s.category] = (pieDataMap[s.category] || 0) + s.resolved;
        }
    });
    let pieData = Object.keys(pieDataMap).map(key => ({ name: key, value: pieDataMap[key] }));
    if (pieData.length === 0) pieData = [{ name: 'No Data', value: 1 }];

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="lg:ml-72 p-6 lg:p-10 transition-all duration-300 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-8 lg:mt-0">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">Staff Performance</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Monthly Analytics Report</p>
                    </div>
                    <div className="flex gap-4">
                        <input 
                            type="month" 
                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-indigo-600 font-semibold animate-pulse">Loading Report Data...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-8 shadow-xl shadow-green-500/20 text-white relative overflow-hidden transform hover:-translate-y-1 transition duration-300">
                                <div className="absolute -top-10 -right-10 p-4 opacity-20">
                                    <Trophy size={160} />
                                </div>
                                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                    <h3 className="text-emerald-100 font-semibold tracking-wider text-xs flex items-center gap-2 mb-4 uppercase"><Trophy size={14} /> TOP PERFORMER OF THE MONTH</h3>
                                    {topPerformer ? (
                                        <>
                                            <div>
                                                <div className="text-3xl lg:text-4xl font-bold mb-1 truncate">{topPerformer.name}</div>
                                                <div className="text-emerald-200 mb-6 font-medium bg-emerald-800/30 inline-block px-3 py-1 rounded-full text-sm">{topPerformer.category}</div>
                                            </div>
                                            <div className="flex gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                                <div className="flex-1">
                                                    <div className="text-xs text-emerald-200 mb-1 uppercase tracking-wider font-semibold">Score</div>
                                                    <div className="font-bold text-2xl">{topPerformer.score}</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xl mt-4 opacity-80 flex-1 flex items-center">No top performer qualified this month.</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden group">
                                    <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition duration-500 transform translate-x-4 translate-y-4">
                                        <TrendingUp size={120} />
                                    </div>
                                    <h3 className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide text-sm mb-4 flex items-center gap-2 uppercase z-10">Total Resolutions</h3>
                                    <p className="text-5xl font-extrabold text-slate-800 dark:text-white z-10">
                                        {staffData.reduce((acc, curr) => acc + curr.resolved, 0)}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden group">
                                     <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition duration-500 transform translate-x-4 translate-y-4">
                                        <AlertTriangle size={120} />
                                    </div>
                                    <h3 className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide text-sm mb-4 flex items-center gap-2 uppercase z-10">Avg Pending Load</h3>
                                    <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 z-10">
                                        {staffData.length > 0 ? Math.round(staffData.reduce((acc, curr) => acc + curr.pending, 0) / staffData.length) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 ml-2">Resolved vs In-Progress</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-color, #1e293b)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                                            <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                            <Bar dataKey="inProgress" name="In-Progress" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 ml-2">Workload Output by Category</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} stroke="none" dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#e2e8f0' : COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Staff Leaderboard</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed performance metrics spanning active complaints.</p>
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <input 
                                        type="text"
                                        placeholder="Search by staff name..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs border-b border-slate-100 dark:border-slate-700/50">
                                        <tr>
                                            <th className="px-8 py-5">Rank</th>
                                            <th className="px-8 py-5">Staff Member</th>
                                            <th className="px-8 py-5">Category</th>
                                            <th className="px-8 py-5 text-center">Assigned / Pending</th>
                                            <th className="px-8 py-5 text-center">Resolved</th>
                                            <th className="px-8 py-5 text-center">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredData.length > 0 ? (
                                            filteredData.map(staff => (
                                                <tr key={staff.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        {staff.rank === 1 && staff.score > 0 ? (
                                                            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 font-bold px-2.5 py-1 rounded-lg text-xs w-full justify-center shadow-sm">
                                                                <Trophy size={12} /> #1
                                                            </div>
                                                        ) : (
                                                            <span className="font-semibold text-slate-500 dark:text-slate-400 pl-4">#{staff.rank}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
                                                            {(staff.name || '?').charAt(0)}{(staff.name || '').split(' ')[1]?.[0] || ''}
                                                        </div>
                                                        {staff.name || 'Unknown'}
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                                                            {staff.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                                        <span className="font-bold text-slate-800 dark:text-white">{staff.assigned}</span> 
                                                        <span className="text-slate-400 mx-1">/</span> 
                                                        <span className="font-bold text-orange-500 dark:text-orange-400">{staff.pending}</span>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-base">{staff.resolved}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{staff.resolutionRate}% Rate</div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">{staff.score}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                        <UserCheck size={48} className="mb-4 opacity-50" />
                                                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No staff performance records found.</p>
                                                        <p className="text-sm mt-1">Try selecting a different month or generating complaints.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
