import { Link, router, usePage } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import { Toaster } from 'react-hot-toast';

export default function AuthenticatedLayout({ children, pageTitle }) {
    const user = usePage().props.auth.user;
    const url = usePage().url;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
            fetch(`/api/search/live?q=${encodeURIComponent(q)}`)
                .then((r) => r.json())
                .then((data) => {
                    setSearchResults(data.results || []);
                    setSearchOpen(true);
                })
                .catch(() => setSearchResults([]));
        }, 250);
    }, []);

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value;
        setSearchQuery(val);
        liveSearch(val);
    }, [liveSearch]);

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery.trim() });
            setSearchOpen(false);
        }
    }, [searchQuery]);

    const handleSearchResultClick = useCallback((result) => {
        router.get(result.url);
        setSearchQuery('');
        setSearchResults([]);
        setSearchOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { name: 'Home', href: '/home', icon: 'fa-home' },
        { name: 'Dashboard', href: '/dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Projects', href: '/projects', icon: 'fa-project-diagram' },
        { name: 'Expenses', href: '/expenses', icon: 'fa-receipt' },
        { name: 'Photos', href: '/photos', icon: 'fa-images' },
        { name: 'Documents', href: '/documents', icon: 'fa-file-alt' },
        { name: 'Timeline', href: '/timeline', icon: 'fa-calendar-alt' },
        { name: 'Receipt Verification', href: '/receipt-verification', icon: 'fa-check-circle' },
        { name: 'WhatsApp', href: '/whatsapp', icon: 'fa-whatsapp' },
        { name: 'Messages', href: '/messages', icon: 'fa-comment-alt' },
        { name: 'Analytics', href: '/analytics', icon: 'fa-chart-bar', roles: ['admin'] },
        { name: 'Users', href: '/users', icon: 'fa-users-cog', roles: ['admin'] },
        { name: 'Profile', href: '/profile', icon: 'fa-user' },
    ].filter(item => !item.roles || item.roles.includes(user.role));

    return (
        <>
            <Toaster position="top-right" />
            
            <div className="min-h-screen bg-black flex">
                {/* Sidebar Overlay for Mobile */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-30 h-screen
                    bg-gradient-to-b from-[#8B0000] to-[#DC143C] border-r border-white/10 flex flex-col
                    transform transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
                `}>
                    {/* Sidebar Brand - Fixed at top */}
                    <Link href="/" className="h-14 flex items-center justify-center border-b border-white/10 flex-shrink-0 hover:bg-white/5 transition px-3">
                        <img 
                            src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png" 
                            alt="Najenga" 
                            className="h-10 w-10 object-contain flex-shrink-0"
                        />
                    </Link>

                    {/* Sidebar Search */}
                    <div className="px-3 py-2 border-b border-white/10" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="flex items-center bg-white/10 rounded-lg">
                                <i className="fas fa-search text-white/50 text-xs pl-2.5"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder={sidebarOpen ? 'Search...' : ''}
                                    className={`bg-transparent text-white text-sm placeholder-white/40 outline-none py-1.5 ${sidebarOpen ? 'w-full px-2' : 'w-0'}`}
                                />
                            </div>
                            {searchOpen && searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 mt-1 bg-black border border-white/20 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                                    {searchResults.map((r) => (
                                        <button
                                            key={`${r.type}-${r.id}`}
                                            type="button"
                                            onClick={() => handleSearchResultClick(r)}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/10 transition"
                                        >
                                            {r.thumb_url ? (
                                                <img src={r.thumb_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <i className={`fas ${r.type === 'document' ? 'fa-file-alt' : r.type === 'photo' ? 'fa-image' : 'fa-receipt'} text-white/40 text-xs`}></i>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-white text-sm truncate">{r.title}</p>
                                                <p className="text-gray-500 text-xs truncate">{r.type}{r.subtitle ? ` - ${r.subtitle}` : ''}</p>
                                            </div>
                                        </button>
                                    ))}
                                    <Link
                                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                        className="block text-center text-xs text-gray-400 hover:text-white py-2 border-t border-white/10 transition"
                                        onClick={() => setSearchOpen(false)}
                                    >
                                        View all results
                                    </Link>
                                </div>
                            )}
                            {searchOpen && searchResults.length === 0 && searchQuery.length >= 2 && (
                                <div className="absolute left-0 right-0 mt-1 bg-black border border-white/20 rounded-xl shadow-2xl z-50 p-3 text-center">
                                    <p className="text-gray-500 text-xs">No results found</p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Navigation - Scrollable */}
                    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = url === item.href || url.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-white text-[#8B0000] shadow-lg font-bold'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }
                                        ${sidebarOpen ? 'gap-2.5' : 'justify-center'}
                                    `}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center`}></i>
                                    <span className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer - Fixed at bottom */}
                    <div className="p-2 border-t border-white/10 flex-shrink-0">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={`flex items-center px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all w-full text-sm
                                ${sidebarOpen ? 'gap-2.5' : 'justify-center'}
                            `}
                            title={!sidebarOpen ? 'Logout' : ''}
                        >
                            <i className="fas fa-sign-out-alt w-5 text-center"></i>
                            <span className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                                Logout
                            </span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                    {/* Top Navbar */}
                    <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-10">
                        {/* Left Side - Toggle & Breadcrumb */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition"
                            >
                                <i className="fas fa-bars text-lg"></i>
                            </button>
                            <span className="text-white font-semibold hidden md:block">{pageTitle || 'Dashboard'}</span>
                        </div>

                        {/* Right Side - User Menu */}
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <Link
                                href="/search"
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition"
                                title="Search"
                            >
                                <i className="fas fa-search text-lg"></i>
                            </Link>

                            {/* Notifications */}
                            <NotificationsDropdown />

                            {/* User Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center">
                                        <i className="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span className="hidden lg:block">{user.first_name || user.name || 'User'} {user.last_name || ''}</span>
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </button>

                                {userDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setUserDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-black border border-white/10 rounded-xl shadow-2xl py-2 z-20">
                                            <div className="px-4 py-2 border-b border-white/10">
                                                <p className="text-white font-medium">{user.first_name || user.name} {user.last_name || ''}</p>
                                                <p className="text-gray-400 text-sm truncate">{user.email}</p>
                                            </div>
                                            <Link href="/" className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/10">
                                                <i className="fas fa-home w-5"></i>Home
                                            </Link>
                                            <Link href={route('profile.edit')} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/10">
                                                <i className="fas fa-user w-5"></i>Profile
                                            </Link>
                                            <div className="border-t border-white/10 mt-2 pt-2">
                                                <Link 
                                                    href={route('logout')} 
                                                    method="post" 
                                                    as="button"
                                                    className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/20 w-full"
                                                >
                                                    <i className="fas fa-sign-out-alt w-5"></i>Logout
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 py-8 px-4 overflow-x-hidden min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
