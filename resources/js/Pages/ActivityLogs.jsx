import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function ActivityLogs({ logs }) {
    return (
        <AuthenticatedLayout>
            <Head title="Activity Logs" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <PageHeader
                        title="Activity Logs"
                        subtitle="Review system actions and changes"
                    />

                    <div className="dashboard-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Action</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Description</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                                No activity logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.action.includes('create') || log.action.includes('add') ? 'bg-green-500/20 text-green-400' :
                                                        log.action.includes('delete') || log.action.includes('remove') ? 'bg-red-500/20 text-red-400' :
                                                            log.action.includes('update') || log.action.includes('edit') ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {log.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                    {log.ip_address}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination placeholder */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-center gap-2">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-md text-sm ${link.active
                                            ? 'bg-[rgb(139,0,0)] text-white'
                                            : 'text-gray-400 hover:bg-white/10'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!link.url}
                                        onClick={() => link.url && (window.location.href = link.url)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
