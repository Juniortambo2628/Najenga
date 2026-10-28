import { useCallback, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import useAction from '@/Hooks/useAction';

export const ROLE_INFO = {
    owner: { label: 'Owner', help: 'Everything, including deleting the project', tone: 'border-rose-400/30 bg-rose-500/15 text-rose-200' },
    manager: { label: 'Manager', help: 'Edits everything and manages people', tone: 'border-amber-400/30 bg-amber-500/10 text-amber-200' },
    editor: { label: 'Editor', help: 'Adds and changes expenses, photos, documents', tone: 'border-sky-400/30 bg-sky-500/10 text-sky-200' },
    viewer: { label: 'Viewer', help: 'Reads and comments only', tone: 'border-white/15 bg-white/5 text-gray-300' },
};

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

const daysLeft = (iso) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

export function RoleBadge({ role }) {
    const info = ROLE_INFO[role] ?? ROLE_INFO.viewer;
    return <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${info.tone}`}>{info.label}</span>;
}

function Avatar({ name }) {
    return (
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-xs font-bold text-white">
            {initials(name)}
        </span>
    );
}

/**
 * Who is in a project, and inviting more people: members with their roles
 * (changeable by owners and managers), pending email invitations (resend,
 * revoke), and leaving the project. Replaces ShareProjectModal.
 */
export default function SharePanel({ show, onClose, project }) {
    const me = usePage().props.auth.user;
    const [state, setState] = useState(null); // { members, invitations, my_role, can_manage, assignable }
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!project?.id) return;
        const { data } = await axios.get(route('projects.members', project.id));
        setState(data);
    }, [project?.id]);

    useEffect(() => {
        if (show) load().catch(() => setState({ members: [], invitations: [], can_manage: false, assignable: [] }));
        else setState(null);
    }, [show, load]);

    const after = { onSuccess: () => load() };

    const invite = useAction((data) => axios.post(route('projects.invitations.store', project.id), data), {
        success: (res) => res.data.message,
        error: false, // shown under the field
        key: () => 'invite',
        onSuccess: () => {
            setEmail('');
            setError('');
            load();
        },
        onError: (err) => setError(err.response?.data?.errors?.email?.[0] || err.response?.data?.errors?.role?.[0] || err.response?.data?.message || 'Could not invite'),
    });

    const changeRole = useAction((member, newRole) => axios.patch(route('projects.members.update', [project.id, member.id]), { role: newRole }), {
        success: (res) => res.data.message,
        error: 'Could not change the role',
        key: (member) => member.id,
        ...after,
    });

    const remove = useAction((member) => axios.delete(route('projects.members.destroy', [project.id, member.id])), {
        confirm: (member) => ({ title: `Remove ${member.name} from the project?`, message: 'They lose access straight away.', confirmLabel: 'Remove' }),
        success: 'Member removed',
        error: 'Could not remove the member',
        key: (member) => member.id,
        ...after,
    });

    const leave = useAction(() => axios.delete(route('projects.members.destroy', [project.id, me.id])), {
        confirm: { title: `Leave "${project?.name}"?`, message: 'You lose access until someone invites you again.', confirmLabel: 'Leave', tone: 'danger' },
        success: (res) => res.data.message,
        error: 'Could not leave the project',
        onSuccess: () => {
            onClose();
            router.visit(route('overview'));
        },
    });

    const resend = useAction((invitation) => axios.post(route('projects.invitations.resend', [project.id, invitation.id])), {
        success: (res) => res.data.message,
        error: 'Could not resend the invitation',
        key: (invitation) => `i${invitation.id}`,
        ...after,
    });

    const revoke = useAction((invitation) => axios.delete(route('projects.invitations.destroy', [project.id, invitation.id])), {
        confirm: (invitation) => ({ title: `Revoke the invitation for ${invitation.email}?`, message: 'The emailed link stops working.', confirmLabel: 'Revoke', tone: 'danger' }),
        success: 'Invitation revoked',
        error: 'Could not revoke the invitation',
        key: (invitation) => `i${invitation.id}`,
        ...after,
    });

    const submit = (e) => {
        e.preventDefault();
        setError('');
        invite.run({ email, role });
    };

    // Owners manage everyone but themselves; managers manage editors and viewers.
    const canManageMember = (member) =>
        state?.can_manage && member.role !== 'owner' && member.id !== me.id && (state.my_role === 'owner' || member.role !== 'manager');

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">Share “{project?.name}”</h2>
                    <p className="mt-1 text-sm text-gray-400">People in this project and what they can do.</p>
                </div>

                {!state ? (
                    <p className="py-10 text-center text-sm text-gray-400">
                        <i aria-hidden="true" className="fas fa-spinner fa-spin mr-2" />
                        Loading members…
                    </p>
                ) : (
                    <div className="space-y-6">
                        {state.can_manage && (
                            <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <label htmlFor="share-email" className="mb-2 block text-sm font-medium text-gray-300">
                                    Invite by email
                                </label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        id="share-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        aria-invalid={!!error}
                                        aria-describedby={error ? 'share-email-error' : 'share-email-hint'}
                                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#8B0000] focus:outline-none focus:ring-0"
                                    />
                                    <select
                                        aria-label="Role for the new member"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#8B0000] focus:outline-none focus:ring-0"
                                    >
                                        {state.assignable.map((r) => (
                                            <option key={r} value={r} className="bg-surface-overlay">
                                                {ROLE_INFO[r].label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={invite.pending}
                                        className="rounded-xl bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                                    >
                                        {invite.pending ? 'Inviting…' : 'Invite'}
                                    </button>
                                </div>
                                {error ? (
                                    <p id="share-email-error" className="mt-2 text-sm text-red-400">{error}</p>
                                ) : (
                                    <p id="share-email-hint" className="mt-2 text-xs text-gray-500">
                                        {ROLE_INFO[role]?.help}. People without an account get an email link that works for 7 days.
                                    </p>
                                )}
                            </form>
                        )}

                        <section aria-labelledby="share-members-heading">
                            <h3 id="share-members-heading" className="mb-2 text-xs font-semibold capitalize text-gray-500">
                                Members · {state.members.length}
                            </h3>
                            <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
                                {state.members.map((member) => (
                                    <li key={member.id} className="flex items-center gap-3 px-4 py-3">
                                        <Avatar name={member.name} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-white">
                                                {member.name}
                                                {member.id === me.id && <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>}
                                            </p>
                                            <p className="truncate text-xs text-gray-400">{member.email}</p>
                                        </div>
                                        {canManageMember(member) ? (
                                            <>
                                                <select
                                                    aria-label={`Role for ${member.name}`}
                                                    value={member.role}
                                                    disabled={changeRole.isPending(member.id)}
                                                    onChange={(e) => changeRole.run(member, e.target.value)}
                                                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-[#8B0000] focus:outline-none focus:ring-0"
                                                >
                                                    {[...new Set([member.role, ...state.assignable])].map((r) => (
                                                        <option key={r} value={r} className="bg-surface-overlay">
                                                            {ROLE_INFO[r].label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => remove.run(member)}
                                                    disabled={remove.isPending(member.id)}
                                                    aria-label={`Remove ${member.name}`}
                                                    title="Remove from project"
                                                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    <i aria-hidden="true" className="fas fa-xmark" />
                                                </button>
                                            </>
                                        ) : (
                                            <RoleBadge role={member.role} />
                                        )}
                                        {member.id === me.id && member.role !== 'owner' && (
                                            <button
                                                type="button"
                                                onClick={() => leave.run()}
                                                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 transition hover:border-red-400/40 hover:text-red-300"
                                            >
                                                Leave
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {state.invitations.length > 0 && (
                            <section aria-labelledby="share-invites-heading">
                                <h3 id="share-invites-heading" className="mb-2 text-xs font-semibold capitalize text-gray-500">
                                    Pending invitations · {state.invitations.length}
                                </h3>
                                <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
                                    {state.invitations.map((invitation) => (
                                        <li key={invitation.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                                            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-white/20 text-gray-400">
                                                <i className="fas fa-envelope text-xs" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-white">{invitation.email}</p>
                                                <p className="text-xs text-gray-500">
                                                    {invitation.invited_by ? `Invited by ${invitation.invited_by} · ` : ''}
                                                    expires in {daysLeft(invitation.expires_at)} day{daysLeft(invitation.expires_at) === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                            <RoleBadge role={invitation.role} />
                                            <button
                                                type="button"
                                                onClick={() => resend.run(invitation)}
                                                disabled={resend.isPending(`i${invitation.id}`)}
                                                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 transition hover:bg-white/5 hover:text-white"
                                            >
                                                Resend
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => revoke.run(invitation)}
                                                disabled={revoke.isPending(`i${invitation.id}`)}
                                                aria-label={`Revoke the invitation for ${invitation.email}`}
                                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                                            >
                                                <i aria-hidden="true" className="fas fa-xmark" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
}
