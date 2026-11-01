import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { startTour } from '@/Components/Tour';

/** The header's account menu (moved from Layouts/AuthenticatedLayout). */
export default function AccountMenu() {
  const user = usePage().props.auth?.user ?? {};
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative" data-tour="account">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Account menu for ${user.first_name || user.name || 'user'}`}
        className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center">
          <i aria-hidden="true" className="fas fa-user text-white text-sm"></i>
        </div>
        <span className="hidden lg:block">{user.first_name || user.name || 'User'} {user.last_name || ''}</span>
        <i aria-hidden="true" className="fas fa-chevron-down text-xs hidden sm:inline"></i>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
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
                setOpen(false);
                startTour();
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/5"
            >
              <i aria-hidden="true" className="fas fa-route w-5"></i>Take the tour
            </button>
            <div className="border-t border-white/10 mt-2 pt-2">
              <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 w-full">
                <i aria-hidden="true" className="fas fa-sign-out-alt w-5"></i>Logout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
