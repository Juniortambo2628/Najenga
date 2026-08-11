import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

const TYPE_LABELS = { document: 'Document', photo: 'Photo', expense: 'Expense' };

export default function SearchIndex({ query = '', type = null, results = [], totals = {} }) {
    const [q, setQ] = useState(query);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        router.get('/search', { q, type });
    }, [q, type]);

    const handleTypeFilter = useCallback((newType) => {
        router.get('/search', { q, type: newType });
    }, [q]);

    return (
        <AuthenticatedLayout>
            <Head title="Search" />
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
                <p className="text-gray-400 text-sm mb-6">Search across all your documents, photos, and expenses</p>

                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <InputLabel value="Search query" />
                            <TextInput
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Type to search..."
                                className="mt-1 block w-full"
                                autoFocus
                            />
                       </div>
                        <PrimaryButton type="submit">Search</PrimaryButton>
                   </div>
               </form>

                {query && (
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <span className="text-xs text-gray-500 uppercase tracking-widest mr-2">Filter</span>
                        <button
                            onClick={() => handleTypeFilter(null)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!type ? 'bg-[#8B0000] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            All ({results.length})
                       </button>
                        <button
                            onClick={() => handleTypeFilter('document')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${type === 'document' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Documents ({totals.documents || 0})
                       </button>
                        <button
                            onClick={() => handleTypeFilter('photo')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${type === 'photo' ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Photos ({totals.photos || 0})
                       </button>
                        <button
                            onClick={() => handleTypeFilter('expense')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${type === 'expense' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Expenses ({totals.expenses || 0})
                       </button>
                   </div>
                )}

                {!query && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-gray-400">Type a query above to search across all your content</p>
                   </div>
                )}

                {query && results.length === 0 && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-gray-400">No results for "{query}".</p>
                   </div>
                )}

                {results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((r) => (
                            <a
                                key={`${r.type}-${r.id}`}
                                href={r.url}
                                className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-[#8B0000]/50 transition block"
                            >
                                <div className="aspect-video bg-white/5 relative overflow-hidden flex items-center justify-center">
                                    {r.thumb_url ? (
                                        <img src={r.thumb_url} alt={r.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-600 text-3xl">[{r.type}]</div>
                                    )}
                                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/60 text-white border border-white/10">
                                        {TYPE_LABELS[r.type] || r.type}
                                   </span>
                               </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold truncate mb-1">{r.title}</h3>
                                    {r.subtitle && <p className="text-gray-500 text-sm truncate mb-2">{r.subtitle}</p>}
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>{r.date}</span>
                                        {r.amount != null && <span className="text-emerald-400 font-mono">KES {Number(r.amount).toLocaleString()}</span>}
                                   </div>
                               </div>
                           </a>
                        ))}
                   </div>
                )}
           </div>
       </AuthenticatedLayout>
    );
}