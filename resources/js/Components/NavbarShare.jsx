import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import SharePanel, { RoleBadge } from '@/Components/SharePanel';
import useActiveProjectId from '@/Hooks/useActiveProjectId';

const buttonClass = 'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white';

/**
 * The navbar's Share button, beside the notifications. With a project picked
 * in the switcher it opens that project's Share panel; on "All projects" it
 * first asks which project.
 */
export default function NavbarShare() {
    const projects = usePage().props.auth?.projects ?? [];
    const [activeId] = useActiveProjectId();
    const [sharing, setSharing] = useState(null);

    if (projects.length === 0) return null;
    const active = projects.find((p) => String(p.id) === activeId) ?? null;
    const label = (project) => (project.role === 'owner' ? 'Share' : 'Members');

    return (
        <>
            {active ? (
                <button type="button" onClick={() => setSharing(active)} className={buttonClass} aria-label={`${label(active)}: ${active.name}`} title={`${label(active)} ${active.name}`}>
                    <i aria-hidden="true" className="fas fa-share-nodes" />
                    <span className="hidden xl:inline">{label(active)}</span>
                </button>
            ) : (
                <Menu as="div" className="relative">
                    <MenuButton className={buttonClass} aria-label="Share a project" title="Share a project">
                        <i aria-hidden="true" className="fas fa-share-nodes" />
                        <span className="hidden xl:inline">Share</span>
                    </MenuButton>
                    <MenuItems anchor="bottom end" className="z-50 mt-1 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-surface-overlay py-1 shadow-2xl focus:outline-none">
                        <p className="px-3 py-2 text-xs text-gray-400">Which project?</p>
                        <div className="max-h-72 overflow-y-auto">
                            {projects.map((project) => (
                                <MenuItem key={project.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSharing(project)}
                                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white"
                                    >
                                        <i aria-hidden="true" className="fas fa-diagram-project w-4 text-gray-500" />
                                        <span className="min-w-0 flex-1 truncate">{project.name}</span>
                                        <RoleBadge role={project.role} />
                                    </button>
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </Menu>
            )}
            {sharing && <SharePanel show project={sharing} onClose={() => setSharing(null)} />}
        </>
    );
}
