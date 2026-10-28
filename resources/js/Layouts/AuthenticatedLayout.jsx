import { Link, router, usePage } from '@inertiajs/react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import ProjectSwitcher from '@/Components/ProjectSwitcher';
import NavbarShare from '@/Components/NavbarShare';
import HistoryDrawer from '@/Components/HistoryDrawer';
import Tour, { startTour } from '@/Components/Tour';
import { AlsoHere, OnlineAvatars } from '@/Components/OnlinePeople';
import { Toaster } from 'react-hot-toast';
import FlashToast from '@/Components/FlashToast';
import ConfirmHost from '@/Components/ConfirmHost';
import { useHasUnsavedChanges } from '@/Utils/unsavedChanges';
import usePresenceHeartbeat from '@/Hooks/usePresenceHeartbeat';
import { useBadges } from '@/Utils/presence';
import { closeHistory, openHistory, useHistoryOpen } from '@/Utils/historyDrawer';
import { PageHeadingContext, fallbackHeading } from '@/Layouts/PageHeadingContext';
import { navSectionsFor } from '@/Config/navigation';

/**
 * The page title in the navbar. A page with a DashboardHero shows its title
 * there; once the hero scrolls behind the navbar, a compact copy appears here
 * (parent breadcrumb, title, back to top). Pages without a hero always show
 * their fallback heading.
 */
export function NavbarTitle({ heading, hero }) {
    if (!hero) {
        return <span className="text-white font-semibold hidden md:block truncate">{heading}</span>;
    }
    return (
        <AnimatePresence initial={false}>
            {!hero.visible && (
                <motion.div
                    key="compact-title"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 min-w-0"
                >
                    <div className="min-w-0 leading-tight">
                        {hero.parent && (
                            <p className="hidden sm:block text-[11px] text-gray-400 truncate">
                                {hero.parent.href
                                    ? <Link href={hero.parent.href} className="hover:text-white transition">{hero.parent.label}</Link>
                                    : hero.parent.label}
                            </p>
                        )}
                        <p className="text-white font-semibold truncate">{heading}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hidden md:inline text-xs text-gray-400 hover:text-white whitespace-nowrap transition"
                        title="Back to top"
                    >
                        <i aria-hidden="true" className="fas fa-arrow-up mr-1"></i>Top
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** lg and up: the sidebar is a column beside the page, not an overlay over it. */
export const isDesktop = () => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 1024px)').matches;

/** "/expenses/12" or a full URL -> "expenses": the key of a sidebar page's change badge. */
const sectionOf = (href) => new URL(href, window.location.origin).pathname.split('/').filter(Boolean)[0] || 'dashboard';

/**
 * Is the sidebar entry `href` the page at `url` (or one under it)? route()
 * gives full URLs and Inertia's url is a path, so compare paths.
 */
export const isCurrent = (url, href) => {
    const path = new URL(url, window.location.origin).pathname;
    const target = new URL(href, window.location.origin).pathname;
    return path === target || path.startsWith(target + '/');
};

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const url = usePage().url;
    const component = usePage().component;

    // Page heading is reported by DashboardHero. Keyed on url so a title from
    // the previous page can never leak into the next one while it mounts.
    const [reported, setReported] = useState({ url: '', title: '', hero: null });
    const setHeading = useCallback(
        (title) => setReported((r) => (r.url === url ? { ...r, title } : { url, title, hero: null })),
        [url],
    );
    const reportHero = useCallback(
        (hero) => setReported((r) => (r.url === url ? { ...r, hero } : { url, title: '', hero })),
        [url],
    );
    // A page with unsaved edits (useUnsavedChangesGuard) shows a chip in the navbar.
    const hasUnsaved = useHasUnsavedChanges();
    usePresenceHeartbeat();
    const badges = useBadges();
    const headingContext = useMemo(() => ({ setHeading, reportHero }), [setHeading, reportHero]);
    const current = reported.url === url;
    const heading = current && reported.title ? reported.title : fallbackHeading(component);
    const hero = current ? reported.hero : null;
    // Open on desktops; on phones and tablets (below lg) it would cover the
    // page, so it starts closed. Pages render their own layout, so every page
    // change starts afresh.
    const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const historyOpen = useHistoryOpen();
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
            router.get(route('search'), { q: searchQuery.trim() });
            setSearchOpen(false);
        }
    }, [searchQuery]);

    const handleSearchResultClick = useCallback((result) => {
        router.get(result.url);
        setSearchQuery('');
        setSearchResults([]);
        setSearchOpen(false);
    }, []);

    // Escape closes whichever popover is open (WCAG 2.1.1 / 2.1.2)
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            setUserDropdownOpen(false);
            setSearchOpen(false);
            // The phone sidebar is an overlay: Escape closes it too.
            if (!isDesktop()) setSidebarOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
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

    // The floating toolbar centres itself over the content beside the sidebar.
    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-w', sidebarOpen ? '16rem' : '5rem');
    }, [sidebarOpen]);

    // Ctrl/⌘+K: search everything (the page's own list search is "/").
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey)) return;
            e.preventDefault();
            document.getElementById('global-search')?.focus();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const navSections = navSectionsFor(user.role);

    return (
        <>
            <MotionConfig reducedMotion="user">
            <PageHeadingContext.Provider value={headingContext}>
            <Toaster position="top-right" />
            <FlashToast />
            <ConfirmHost />
            <Tour user={user} autoStart={component === 'Dashboard'} />

            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div className="min-h-screen bg-[#0b0c0d] flex">
                {/* Sidebar Overlay for Mobile */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-[35] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside data-tour="sidebar" className={`
                    fixed inset-y-0 left-0 z-40 h-screen
                    bg-[#170d0f] bg-gradient-to-b from-[#1c0f12] to-[#120a0b] border-r border-rose-950/40 shadow-2xl flex flex-col
                    transform transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
                `}>
                    {/* Sidebar Brand */}
                    <Link
                        href={route('home')}
                        aria-label="Najenga home"
                        className={`flex flex-shrink-0 items-center justify-center transition hover:bg-white/[0.04] ${sidebarOpen ? 'px-6 pb-4 pt-6' : 'px-2 py-4'}`}
                    >
                        <img
                            src="/Najenga-logos/Najenga-Logo-trimmed.webp"
                            alt="Najenga"
                            className={`object-contain transition-all duration-300 ${sidebarOpen ? 'h-20 w-full max-w-[9.5rem]' : 'h-9 w-12'}`}
                        />
                    </Link>

                    {/* Navigation, grouped */}
                    <nav aria-label="Main" className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
                        {navSections.map((section, index) => (
                            <div key={section.title || index} className={index > 0 ? 'mt-4' : ''}>
                                {section.title && sidebarOpen && (
                                    <p className="mb-1 px-3 text-xs font-semibold capitalize text-white/45">{section.title}</p>
                                )}
                                {section.title && !sidebarOpen && <div aria-hidden="true" className="mx-3 mb-2 h-px bg-white/10" />}
                                <ul className="space-y-0.5" aria-label={section.title}>
                                    {section.items.map((item) => {
                                        const isActive = isCurrent(url, item.href);
                                        const changes = isActive ? 0 : badges[sectionOf(item.href)] ?? 0;
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={`
                                                        flex items-center border border-transparent px-3 py-2 rounded-xl transition-all text-sm
                                                        ${isActive
                                                            ? 'bg-white/[0.08] border-white/[0.08] text-white font-semibold'
                                                            : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                                                        }
                                                        ${sidebarOpen ? 'gap-2.5' : 'justify-center'}
                                                    `}
                                                    title={!sidebarOpen ? item.name : undefined}
                                                    aria-label={!sidebarOpen || changes ? `${item.name}${changes ? `, ${changes} new change${changes === 1 ? '' : 's'}` : ''}` : undefined}
                                                    aria-current={isActive ? 'page' : undefined}
                                                >
                                                    <span className="relative">
                                                        <i aria-hidden="true" className={`${item.brand ? 'fab' : 'fas'} ${item.icon} w-5 text-center`}></i>
                                                        {changes > 0 && !sidebarOpen && (
                                                            <span aria-hidden="true" className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#DC143C]" />
                                                        )}
                                                    </span>
                                                    <span className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                                                        {item.name}
                                                    </span>
                                                    {changes > 0 && sidebarOpen && (
                                                        <span aria-hidden="true" title={`${changes} new since you last looked`} className="ml-auto rounded-full bg-[#DC143C]/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200">
                                                            {changes >= 99 ? '99+' : changes}
                                                        </span>
                                                    )}
                                                    {isActive && sidebarOpen && !changes && (
                                                        <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC143C]" />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 overflow-x-clip ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                    {/* Top Navbar */}
                    {/* Above everything in the page (sticky toolbars, heroes), so its menus are never covered. */}
                    <header className="h-16 bg-[#0b0c0d]/90 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
                        {/* Left Side - Toggle & Title */}
                        <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
                                aria-expanded={sidebarOpen}
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition"
                            >
                                <i aria-hidden="true" className="fas fa-bars text-lg"></i>
                            </button>
                            <NavbarTitle heading={heading} hero={hero} />
                            <ProjectSwitcher />
                            <AlsoHere />
                            {hasUnsaved && (
                                <span role="status" className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                    <i aria-hidden="true" className="fas fa-circle-exclamation" />
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        {/* Right Side - Search + User Menu */}
                        <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
                            {/* Live Search */}
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
                                            onChange={handleSearchChange}
                                            placeholder="Search everything…"
                                            title="Search everything (Ctrl+K)"
                                            className="bg-transparent border-0 rounded-lg text-white text-sm placeholder-gray-400 outline-none focus:ring-0 focus-visible:!outline-none py-1.5 px-3 w-48 focus:w-64 transition-all duration-300"
                                        />
                                    </div>
                                </form>
                                {searchOpen && searchResults.length > 0 && (
                                    <div className="absolute right-0 mt-1 w-80 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                                        {searchResults.map((r) => (
                                            <button
                                                key={`${r.type}-${r.id}`}
                                                type="button"
                                                onClick={() => handleSearchResultClick(r)}
                                                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 transition"
                                            >
                                                {r.thumb_url ? (
                                                    <img loading="lazy" decoding="async"  src={r.thumb_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
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
                                    <div className="absolute right-0 mt-1 w-80 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl z-50 p-3 text-center">
                                        <p className="text-gray-400 text-xs">No results found</p>
                                    </div>
                                )}
                            </div>

                            {/* Notifications */}
                            <div className="hidden sm:block">
                                <OnlineAvatars />
                            </div>

                            {/* Version history of the records on this page */}
                            <button
                                type="button"
                                onClick={openHistory}
                                data-tour="history"
                                aria-label="Version history"
                                title="Version history"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <i aria-hidden="true" className="fas fa-clock-rotate-left" />
                            </button>
                            <HistoryDrawer show={historyOpen} onClose={closeHistory} />

                            <div data-tour="share">
                                <NavbarShare />
                            </div>

                            <div data-tour="notifications">
                                <NotificationsDropdown />
                            </div>

                            {/* User Dropdown */}
                            <div className="relative" data-tour="account">
                                <button 
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    aria-expanded={userDropdownOpen}
                                    aria-label={`Account menu for ${user.first_name || user.name || 'user'}`}
                                    className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center">
                                        <i aria-hidden="true" className="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span className="hidden lg:block">{user.first_name || user.name || 'User'} {user.last_name || ''}</span>
                                    <i aria-hidden="true" className="fas fa-chevron-down text-xs hidden sm:inline"></i>
                                </button>

                                {userDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setUserDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-surface-overlay border border-white/[0.08] rounded-xl shadow-2xl py-2 z-20">
                                            <div className="px-4 py-2 border-b border-white/10">
                                                <p className="text-white font-medium">{user.first_name || user.name} {user.last_name || ''}</p>
                                                <p className="text-gray-400 text-sm truncate">{user.email}</p>
                                            </div>
                                            <Link href={route('home')} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5">
                                                <i aria-hidden="true" className="fas fa-home w-5"></i>Home
                                            </Link>
                                            <Link href={route('settings')} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-white/5">
                                                <i aria-hidden="true" className="fas fa-gear w-5"></i>Settings
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUserDropdownOpen(false);
                                                    startTour();
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/5"
                                            >
                                                <i aria-hidden="true" className="fas fa-route w-5"></i>Take the tour
                                            </button>
                                            <div className="border-t border-white/10 mt-2 pt-2">
                                                <Link 
                                                    href={route('logout')} 
                                                    method="post" 
                                                    as="button"
                                                    className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 w-full"
                                                >
                                                    <i aria-hidden="true" className="fas fa-sign-out-alt w-5"></i>Logout
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    {/* Bottom padding keeps the last row clear of the floating toolbar. */}
                    <main id="main-content" tabIndex={-1} className="flex-1 pt-8 pb-28 lg:pb-24 px-4 overflow-x-clip min-w-0">
                        {children}
                    </main>
                </div>
            </div>
            </PageHeadingContext.Provider>
            </MotionConfig>
        </>
    );
}
