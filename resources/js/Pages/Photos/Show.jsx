import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';

export default function Show({ photo }) {
    return (
        <AuthenticatedLayout>
            <Head title={photo.title} />

            <div className="max-w-4xl mx-auto">
                <DashboardHero
                    title={photo.title}
                    subtitle={photo.project?.name || 'Photo details'}
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Photos', href: '/photos' },
                        { label: photo.title },
                    ]}
                    actions={
                        <div className="flex gap-3">
                            {photo.is_featured && (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    <i className="fas fa-star mr-1"></i>Featured
                                </span>
                            )}
                            <Link
                                href={route('photos.edit', photo.id)}
                                className="px-4 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center text-sm"
                            >
                                <i className="fas fa-edit mr-2"></i> Edit
                            </Link>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Photo</h3>
                            {photo.photo_url ? (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center">
                                    <img
                                        src={photo.preview_url || photo.photo_url}
                                        alt={photo.title}
                                        className="max-w-full max-h-[600px] object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
                                    <i className="fas fa-image text-3xl text-gray-600"></i>
                                    <p className="text-sm">No image available</p>
                                </div>
                            )}
                        </section>

                        {photo.description && (
                            <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{photo.description}</p>
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Category</dt>
                                    <dd className="text-gray-300">{photo.category || '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Location</dt>
                                    <dd className="text-gray-300">{photo.location || '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Date</dt>
                                    <dd className="text-gray-300 font-mono">{photo.photo_date || '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Created</dt>
                                    <dd className="text-gray-300">{photo.created_at ? new Date(photo.created_at).toLocaleDateString() : '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('photos.edit', photo.id)}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-edit text-[#DC143C]"></i> Edit Photo
                                </Link>
                                <Link
                                    href={route('photos')}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-list text-[#DC143C]"></i> Back to Photos
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
