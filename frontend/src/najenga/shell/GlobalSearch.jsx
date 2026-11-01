import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';

/** The header's live search (moved from Layouts/AuthenticatedLayout). Ctrl/⌘+K focuses it. */
export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);

  const liveSearch = useCallback((q) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      fetch(`/api/search/live?q=${encodeURIComponent(q)}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((data) => {
          setSearchResults(data.results || []);
          setSearchOpen(true);
        })
        .catch(() => setSearchResults([]));
    }, 250);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get(route('search'), { q: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  const handleSearchResultClick = (result) => {
    router.get(result.url);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  return (
    <>
      {/* Phones: the search page instead of the inline box. */}
      <Link href={route('search')} aria-label="Search" className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white sm:hidden">
        <i aria-hidden="true" className="fas fa-search" />
      </Link>
      <div className="relative hidden sm:block" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative" role="search">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg transition-colors focus-within:border-white/25 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rose-400">
            <i aria-hidden="true" className="fas fa-search text-gray-400 text-xs pl-3"></i>
            <input
              id="global-search"
              type="text"
              aria-label="Search projects, expenses, photos and documents"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                liveSearch(e.target.value);
              }}
              placeholder="Search everything…"
              title="Search everything (Ctrl+K)"
              className="bg-transparent border-0 rounded-lg text-white text-sm placeholder-gray-400 outline-none focus:ring-0 focus-visible:!outline-none py-1.5 px-3 w-48 focus:w-64 transition-all duration-300"
            />
          </div>
        </form>
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute right-0 mt-1 w-80 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
            {searchResults.map((r) => (
              <button key={`${r.type}-${r.id}`} type="button" onClick={() => handleSearchResultClick(r)} className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 transition">
                {r.thumb_url ? (
                  <img loading="lazy" decoding="async" src={r.thumb_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                    <i aria-hidden="true" className={`fas ${r.type === 'document' ? 'fa-file-alt' : r.type === 'photo' ? 'fa-image' : 'fa-receipt'} text-gray-400 text-xs`}></i>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{r.title}</p>
                  <p className="text-gray-400 text-xs truncate">{r.type}{r.subtitle ? ` - ${r.subtitle}` : ''}</p>
                </div>
              </button>
            ))}
            <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="block text-center text-xs text-gray-400 hover:text-white py-2 border-t border-white/10 transition" onClick={() => setSearchOpen(false)}>
              View all results
            </Link>
          </div>
        )}
        {searchOpen && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="absolute right-0 mt-1 w-80 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl z-50 p-3 text-center">
            <p className="text-gray-400 text-xs">No results found</p>
          </div>
        )}
      </div>
    </>
  );
}
