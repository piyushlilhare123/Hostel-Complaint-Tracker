import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, Mail, Lock, ShieldCheck, UserCircle, 
    Building, Home, Briefcase, UserPlus, AlertCircle 
} from 'lucide-react';
import loginBg from '../assets/login_bg.png';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student',
        hostelBlock: 'A',
        roomNumber: '',
        domain: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        const { success, message } = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            formData.role === 'Student' ? formData.hostelBlock : undefined,
            formData.role === 'Student' ? formData.roomNumber : undefined,
            formData.role === 'Staff' ? formData.domain : undefined
        );

        if (success) {
            navigate('/login');
        } else {
            setError(message);
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden font-inter py-12 px-4"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>

            <div className="relative z-10 w-full max-w-[550px]">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4 ring-8 ring-indigo-600/10">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                            Hostel Complaint<br />Management System
                        </h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Create your professional account below
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-shake">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Registration Role</label>
                            <div className="relative group">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white font-medium appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    <option value="Student">Hostel Student</option>
                                    <option value="Staff">Maintenance Staff</option>
                                    <option value="Admin">Portal Administrator</option>
                                </select>
                            </div>
                        </div>

                        {/* Student Specific Fields */}
                        {formData.role === 'Student' && (
                            <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Block</label>
                                    <div className="relative group">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <select
                                            name="hostelBlock"
                                            value={formData.hostelBlock}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white font-medium appearance-none transition-all"
                                        >
                                            <option value="A">Block A</option>
                                            <option value="B">Block B</option>
                                            <option value="C">Block C</option>
                                            <option value="D">Block D</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Room No.</label>
                                    <div className="relative group">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                            placeholder="101"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Staff Specific Fields */}
                        {formData.role === 'Staff' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Expertise Domain</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                    <select
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white font-medium appearance-none cursor-pointer transition-all"
                                        required
                                    >
                                        <option value="">Select Domain</option>
                                        <optgroup label="Maintenance">
                                            <option value="Electrician">Electrician</option>
                                            <option value="Plumber">Plumber</option>
                                            <option value="Carpenter">Carpenter</option>
                                        </optgroup>
                                        <optgroup label="Facilities">
                                            <option value="Housekeeping">Housekeeping</option>
                                            <option value="Laundry">Laundry Staff</option>
                                        </optgroup>
                                        <optgroup label="Food & Safety">
                                            <option value="Mess Manager">Mess Manager</option>
                                            <option value="Security">Security Guard</option>
                                            <option value="IT Support">IT Support</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all font-bold text-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
                        >
                            Complete Registration
                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sign In Instead</Link>
                        </p>
                    </div>
                </div>
                
                {/* Copyright/Info */}
                <p className="mt-8 text-center text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                    © 2026 Hostel Complaint Management System
                </p>
            </div>
        </div>
    );
}
