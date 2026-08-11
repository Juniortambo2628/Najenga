import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ receipts = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="Receipts" />

            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Receipts</h1>
                        <p className="text-gray-400 mt-1">View and manage uploaded receipts</p>
                    </div>
                    <Link
                        href={route('receipt-verification')}
                        className="px-6 py-3 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center gap-2"
                    >
                        <i className="fas fa-receipt"></i>
                        Verify Receipt
                    </Link>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-gray-400 text-sm font-medium">ID</th>
                                    <th className="px-6 py-4 text-gray-400 text-sm font-medium">Expense ID</th>
                                    <th className="px-6 py-4 text-gray-400 text-sm font-medium">Filename</th>
                                    <th className="px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                                    <th className="px-6 py-4 text-gray-400 text-sm font-medium">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No receipts found.
                                        </td>
                                    </tr>
                                ) : (
                                    receipts.map((receipt) => (
                                        <tr key={receipt.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                            <td className="px-6 py-4 text-gray-300 text-sm">#{receipt.id}</td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">{receipt.expense_id || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                                                        <i className="fas fa-file-image text-sm"></i>
                                                    </div>
                                                    <span className="text-white text-sm font-medium">{receipt.filename || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                                    receipt.verification_status === 'verified'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : receipt.verification_status === 'rejected'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                    {receipt.verification_status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(receipt.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
