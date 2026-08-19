import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ShareProjectModal from '@/Components/ShareProjectModal';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { formatCurrency } from '@/Config/currencies';

export default function Show({ project, photos, expenses, totalExpenses = 0, documents, auth }) {
    const [showShareModal, setShowShareModal] = useState(false);

    const teamMembers = project.users || [];

    return (
        <AuthenticatedLayout>
            <Head title={project.name} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href={route('projects')} className="text-gray-400 hover:text-white transition">
                                <i className="fas fa-arrow-left"></i> Projects
                            </Link>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-200">{project.name}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                        <p className="text-gray-400 mt-1 flex items-center gap-2">
                            <i className="fas fa-map-marker-alt"></i> {project.location}
                        </p>
                    </div>
                    <div className="flex gap-3">
                         <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                            project.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            project.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                            {project.status?.replace('_', ' ').toUpperCase()}
                        </div>
                        <Link href={route('projects.edit', project.id)} className="px-5 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center">
                            <i className="fas fa-edit mr-2"></i> Edit
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Budget</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(project.budget, project.currency)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Expenses</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses, project.currency)}</p>
                    </div>
                   <div className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Start Date</p>
                        <p className="text-xl font-semibold text-white">{project.start_date || 'TBD'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Team ({teamMembers.length})</p>
                        <div className="flex -space-x-3 mt-1">
                            {teamMembers.map((user) => {
                                const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
                                const role = user.pivot?.role || 'viewer';
                                return (
                                    <div
                                        key={user.id}
                                        className="w-8 h-8 rounded-full bg-gray-700 border-2 border-black flex items-center justify-center text-xs text-white relative group cursor-pointer"
                                        title={`${userName} (${role})`}
                                    >
                                        {(userName || '?').charAt(0).toUpperCase()}
                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 border border-white/10">
                                            {userName} · {role}
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition"
                                title="Add team member"
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">About Project</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {project.description || 'No description provided.'}
                            </p>
                        </section>

                        {/* Recent Photos */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Recent Photos</h3>
                                <Link href="/photos" className="text-sm text-[#DC143C] hover:text-[#8B0000]">View All</Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-800 relative group">
                                        <img src={`/storage/${photo.file_path}`} alt={photo.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">{photo.title}</span>
                                        </div>
                                    </div>
                                ))}
                                {photos.length === 0 && <p className="text-gray-500 text-sm col-span-3">No photos uploaded yet.</p>}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-8">
                        {/* Recent Expenses */}
                         <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Recent Expenses</h3>
                                <Link href="/expenses" className="text-sm text-[#DC143C] hover:text-[#8B0000]">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {expenses.map(expense => (
                                    <div key={expense.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-200 text-sm font-medium">{expense.title}</p>
                                            <p className="text-gray-500 text-xs">{new Date(expense.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-white font-bold">{formatCurrency(expense.amount, expense.currency || project.currency)}</span>
                                    </div>
                                ))}
                                {expenses.length === 0 && <p className="text-gray-500 text-sm">No expenses recorded.</p>}
                            </div>
                        </section>

                        {/* Documents */}
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Documents</h3>
                                <Link href="/documents" className="text-sm text-[#DC143C] hover:text-[#8B0000]">View All</Link>
                            </div>
                             <div className="space-y-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                                            <i className="fas fa-file-pdf"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-200 text-sm font-medium truncate">{doc.title}</p>
                                            <p className="text-gray-500 text-xs">{doc.document_type}</p>
                                        </div>
                                    </div>
                                ))}
                                {documents.length === 0 && <p className="text-gray-500 text-sm">No documents found.</p>}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Share / Team Modal */}
            <ShareProjectModal
                show={showShareModal}
                onClose={() => setShowShareModal(false)}
                project={project}
                teamMembers={teamMembers}
                onSuccess={() => router.reload({ only: ['project'] })}
            />
        </AuthenticatedLayout>
    );
}
