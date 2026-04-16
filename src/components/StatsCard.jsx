export default function StatsCard({ title, value }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300 w-full">
            <h3 className="text-gray-500 dark:text-slate-400 font-medium">{title}</h3>
            <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">{value}</p>
        </div>
    );
}
