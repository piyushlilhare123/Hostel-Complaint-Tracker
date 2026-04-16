import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function FileComplaint() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { user, token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (videoFile) {
                formData.append('video', videoFile);
            }

            const response = await fetch('http://localhost:5000/api/complaints', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired. Please login again.');
                }
                console.error('[FRONTEND DEBUG] Server responded with error:', errorData);
                throw new Error(errorData.message || errorData.error || JSON.stringify(errorData) || 'Failed to file complaint');
            }

            // Show success message or redirect
            alert('Complaint filed successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('[FRONTEND DEBUG] Caught Exception in handleSubmit:', err);
            setError(`Error: ${err.message || 'Something went wrong.'}`);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="lg:ml-72 p-6 lg:p-10 transition-all duration-300">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">File a New Complaint</h2>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm max-w-2xl transition-colors duration-300">
                    {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Subject</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                placeholder="Brief summary of the issue"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                >
                                    <option>General</option>
                                    <option>Maintenance</option>
                                    <option>IT Support</option>
                                    <option>Academic</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition"
                                placeholder="Detailed description of the problem..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Upload Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300 transition"
                                />
                                {imageFile && <p className="text-xs text-slate-500 mt-1 truncate">Selected: {imageFile.name}</p>}
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Upload Video (Optional)</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300 transition"
                                />
                                {videoFile && <p className="text-xs text-slate-500 mt-1 truncate">Selected: {videoFile.name}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg transition shadow-md"
                            >
                                Submit Complaint
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
