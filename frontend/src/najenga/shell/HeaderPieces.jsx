import { usePage } from '@inertiajs/react';
import ProjectSwitcher from '@/Components/ProjectSwitcher';
import NavbarShare from '@/Components/NavbarShare';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import HistoryDrawer from '@/Components/HistoryDrawer';
import { AlsoHere, OnlineAvatars } from '@/Components/OnlinePeople';
import { useHasUnsavedChanges } from '@/Utils/unsavedChanges';
import { closeHistory, openHistory, useHistoryOpen } from '@/Utils/historyDrawer';

/** After the page title: the project switcher, who else is here, unsaved changes. */
export function HeaderStart() {
  const hasUnsaved = useHasUnsavedChanges();
  return (
    <>
      <ProjectSwitcher />
      <AlsoHere />
      {hasUnsaved && (
        <span role="status" className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
          <i aria-hidden="true" className="fas fa-circle-exclamation" />
          Unsaved changes
        </span>
      )}
    </>
  );
}

export function Online() {
  return (
    <div className="hidden sm:block">
      <OnlineAvatars />
    </div>
  );
}

/** Version history of the records on this page. */
export function History() {
  const open = useHistoryOpen();
  return (
    <>
      <button type="button" onClick={openHistory} data-tour="history" aria-label="Version history" title="Version history" className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white">
        <i aria-hidden="true" className="fas fa-clock-rotate-left" />
      </button>
      <HistoryDrawer show={open} onClose={closeHistory} />
    </>
  );
}

export function Share() {
  return (
    <div data-tour="share">
      <NavbarShare />
    </div>
  );
}

export function Notifications() {
  return (
    <div data-tour="notifications">
      <NotificationsDropdown />
    </div>
  );
}

export function MenuIcon() {
  return <i aria-hidden="true" className="fas fa-bars text-lg" />;
}

/** Who is signed in (for the sidebar's role filter). */
export function useUser() {
  return usePage().props.auth?.user ?? null;
}
