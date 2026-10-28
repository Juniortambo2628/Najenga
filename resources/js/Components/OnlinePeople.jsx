import { NAV_ITEMS } from '@/Config/navigation';
import { useOnline } from '@/Utils/presence';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

const sectionOf = (path) => path.split('/').filter(Boolean)[0] || 'dashboard';

/** "expenses" -> "Expenses", from the sidebar's own names. */
export function pageLabel(page) {
    const item = NAV_ITEMS.find((nav) => sectionOf(new URL(nav.href, window.location.origin).pathname) === page);
    return item?.name ?? page.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function Avatar({ person, size = 'h-8 w-8 text-[11px]', title }) {
    return (
        <span
            title={title}
            className={`relative inline-flex ${size} shrink-0 items-center justify-center rounded-full border-2 border-[#0b0c0d] bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] font-bold text-white`}
        >
            {initials(person.name)}
            <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0c0d] bg-emerald-400" />
        </span>
    );
}

function Stack({ people, max, size, label }) {
    const shown = people.slice(0, max);
    const more = people.length - shown.length;
    return (
        <div role="group" aria-label={label} className="flex items-center -space-x-2">
            {shown.map((person) => (
                <Avatar key={person.id} person={person} size={size} title={`${person.name} · ${pageLabel(person.page)}`} />
            ))}
            {more > 0 && (
                <span className={`inline-flex ${size} items-center justify-center rounded-full border-2 border-[#0b0c0d] bg-white/10 font-semibold text-gray-200`}>+{more}</span>
            )}
            <span className="sr-only">
                {people.map((p) => `${p.name} (${pageLabel(p.page)})`).join(', ')}
            </span>
        </div>
    );
}

/** Navbar: collaborators online in your projects, and where. */
export function OnlineAvatars() {
    const online = useOnline();
    if (online.length === 0) return null;
    return <Stack people={online} max={4} size="h-8 w-8 text-[11px]" label={`${online.length} online in your projects`} />;
}

/** "Mary is also here": others on the same page (the same project, on a project's page). */
export function AlsoHere() {
    const online = useOnline();
    const segments = window.location.pathname.split('/').filter(Boolean);
    const page = segments[0] || 'dashboard';
    const projectId = page === 'projects' && /^\d+$/.test(segments[1] ?? '') ? Number(segments[1]) : null;
    const here = online.filter((p) => p.page === page && (projectId === null || p.project_id === projectId));
    if (here.length === 0) return null;

    const names = here.length === 1 ? here[0].name : here.length === 2 ? `${here[0].name} and ${here[1].name}` : `${here[0].name} and ${here.length - 1} others`;
    return (
        <span role="status" className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 md:inline-flex">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {names} {here.length === 1 ? 'is' : 'are'} also here
        </span>
    );
}

/** On a project card: who is online in that project. */
export function ProjectOnline({ projectId }) {
    const online = useOnline().filter((p) => p.projects?.includes(Number(projectId)));
    if (online.length === 0) return null;
    return <Stack people={online} max={3} size="h-6 w-6 text-[9px]" label={`${online.length} online in this project`} />;
}
