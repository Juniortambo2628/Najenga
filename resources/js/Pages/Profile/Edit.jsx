import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import SharePanel, { RoleBadge } from '@/Components/SharePanel';
import useAction, { visit } from '@/Hooks/useAction';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { rootBreadcrumbs } from '@/Config/navigation';
import { CURRENCY_OPTIONS } from '@/Config/currencies';
import LinkWhatsAppForm from './Partials/LinkWhatsAppForm';
import TwoFactorAuthenticationForm from './Partials/TwoFactorAuthenticationForm';
import PasskeysForm from './Partials/PasskeysForm';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * The Settings page's sections, grouped as the side panel shows them. Each
 * row's description is its current state, so the panel doubles as a summary.
 */
export function settingsSections({ isAdmin, twoFactor = {}, passkeys = [], whatsapp = {}, loginAlerts, projects = [] }) {
    return [
        { id: 'profile', group: 'Account', label: 'Profile', description: 'Name, email and phone', icon: 'fa-id-card' },
        { id: 'password', group: 'Account', label: 'Password', description: 'Change your password', icon: 'fa-key' },
        { id: 'two-factor', group: 'Security', label: 'Two-factor sign-in', description: twoFactor.enabled ? 'On' : 'Off', icon: 'fa-shield-halved' },
        { id: 'passkeys', group: 'Security', label: 'Passkeys', description: passkeys.length ? plural(passkeys.length, 'passkey') : 'None yet', icon: 'fa-fingerprint' },
        { id: 'sign-in', group: 'Security', label: 'Sign-in alerts', description: loginAlerts ? 'Emails on a new device' : 'Off', icon: 'fa-bell' },
        { id: 'whatsapp', group: 'Connections', label: 'WhatsApp', description: whatsapp.verified || whatsapp.verified_at ? 'Linked' : 'Not linked', icon: 'fa-comment-dots' },
        { id: 'preferences', group: 'Preferences', label: 'Currency & notifications', description: 'Defaults and what you hear about', icon: 'fa-sliders' },
        { id: 'projects', group: 'Preferences', label: 'Your projects', description: plural(projects.length, 'project'), icon: 'fa-diagram-project' },
        ...(isAdmin ? [{ id: 'workspace', group: 'Workspace', label: 'Workspace', description: 'Integrations and people', icon: 'fa-building' }] : []),
        { id: 'delete', group: 'Danger zone', label: 'Delete account', description: 'Remove your account for good', icon: 'fa-triangle-exclamation' },
    ];
}

/** A titled card for one section (partials with their own heading pass no title). */
function SettingsCard({ icon, title, description, tone = 'default', children }) {
    return (
        <section className={`panel p-6 ${tone === 'danger' ? 'border-red-500/15' : ''}`}>
            {title && (
                <header className="mb-6 flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-rose-500/10 text-rose-300'}`}>
                        <i aria-hidden="true" className={`fas ${icon}`} />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-white">{title}</h2>
                        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
                    </div>
                </header>
            )}
            {children}
        </section>
    );
}

/** An on/off row: label and help on the left, a switch on the right. */
function SwitchRow({ id, label, help, checked, onChange, icon }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
                {icon && (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                        <i aria-hidden="true" className={`fas ${icon}`} />
                    </span>
                )}
                <div>
                    <label htmlFor={id} className="text-sm font-medium text-white">{label}</label>
                    <p className="text-xs text-gray-400">{help}</p>
                </div>
            </div>
            <span className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span
                    aria-hidden="true"
                    onClick={() => onChange(!checked)}
                    className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#DC143C] peer-checked:after:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-400"
                />
            </span>
        </div>
    );
}

/** WhatsApp: link a number, then verify the one on your profile. */
function WhatsAppSection({ whatsapp }) {
    const { errors } = usePage().props;
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');

    // Validation errors show beside the code field (page props), not as toasts.
    const sendCode = useAction(() => visit('post', route('profile.whatsapp.send-code')), {
        error: false,
        key: () => 'send',
        onSuccess: () => setCodeSent(true),
    });
    const sendWhatsAppCode = () => {
        setCode('');
        sendCode.run();
    };
    const verifyCode = useAction((value) => visit('post', route('profile.whatsapp.verify'), { code: value }), {
        error: false,
        key: () => 'verify',
        onSuccess: () => {
            setCodeSent(false);
            setCode('');
        },
    });

    return (
        <>
            <SettingsCard>
                <LinkWhatsAppForm whatsapp={whatsapp} />
            </SettingsCard>
            <SettingsCard icon="fa-circle-check" title="Verify for alerts" description="Verify your WhatsApp number to receive receipts and alerts.">
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        {whatsapp.verified
                            ? `${whatsapp.phone} can receive WhatsApp messages from Najenga.`
                            : whatsapp.phone
                              ? `We will send a 6-digit code to ${whatsapp.phone} on WhatsApp.`
                              : 'Add a phone number to your profile before verifying WhatsApp.'}
                    </p>
                    {whatsapp.verified && (
                        <span className="inline-block rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Verified</span>
                    )}
                    {!whatsapp.verified && whatsapp.phone && !codeSent && (
                        <button
                            type="button"
                            onClick={sendWhatsAppCode}
                            className="rounded-xl bg-[rgb(139,0,0)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[rgb(160,20,20)]"
                        >
                            Send verification code
                        </button>
                    )}
                    {!whatsapp.verified && whatsapp.phone && codeSent && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                verifyCode.run(code);
                            }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                aria-label="Verification code"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="6-digit code"
                                className="auth-input w-40"
                            />
                            <button
                                type="submit"
                                disabled={code.length !== 6}
                                className="rounded-xl bg-[rgb(139,0,0)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[rgb(160,20,20)] disabled:opacity-50"
                            >
                                Verify
                            </button>
                            <button type="button" onClick={sendWhatsAppCode} className="text-sm text-gray-400 transition hover:text-white">
                                Resend code
                            </button>
                        </form>
                    )}
                    <InputError message={errors?.whatsapp || errors?.code} className="mt-1" />
                </div>
            </SettingsCard>
        </>
    );
}

/** Default currency and which notifications to get; each change saves at once. */
function PreferencesSection({ preferences }) {
    const [prefs, setPrefs] = useState(preferences);
    const save = useAction((changes) => visit('patch', route('settings.preferences'), changes), {
        key: () => 'preferences',
        // Undo the optimistic change when the save fails.
        onError: (err, changes) => setPrefs((current) => ({ ...current, ...Object.fromEntries(Object.keys(changes).map((k) => [k, preferences[k]])) })),
    });
    const change = (key, value) => {
        setPrefs((current) => ({ ...current, [key]: value }));
        save.run({ [key]: value });
    };

    return (
        <>
            <SettingsCard icon="fa-coins" title="Currency" description="New expenses start in this currency. You can still pick another on each one.">
                <label htmlFor="pref-currency" className="mb-1.5 block text-sm font-medium text-gray-300">Default currency</label>
                <select id="pref-currency" value={prefs.currency} onChange={(e) => change('currency', e.target.value)} className="auth-input max-w-xs">
                    {CURRENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </SettingsCard>
            <SettingsCard icon="fa-bell" title="Notifications" description="Choose what Najenga tells you about.">
                <div className="space-y-3">
                    <SwitchRow
                        id="pref-activity"
                        icon="fa-inbox"
                        label="Project activity"
                        help="A notification when someone adds or changes something in a project you're on."
                        checked={!!prefs.activity_notifications}
                        onChange={(value) => change('activity_notifications', value)}
                    />
                    <SwitchRow
                        id="pref-digest"
                        icon="fa-envelope-open-text"
                        label="Weekly WhatsApp summary"
                        help="An email each week with what came in over WhatsApp and the drafts waiting for you."
                        checked={!!prefs.weekly_digest}
                        onChange={(value) => change('weekly_digest', value)}
                    />
                </div>
            </SettingsCard>
        </>
    );
}

/** Every project you're on, your role, and (for owners and managers) sharing. */
function ProjectsSection({ projects }) {
    const [sharing, setSharing] = useState(null);
    return (
        <SettingsCard icon="fa-diagram-project" title="Your projects" description="The projects you can see, and what you can do in each. Owners and managers decide who else is on a project.">
            {projects.length === 0 ? (
                <p className="text-sm text-gray-400">You're not on any projects yet.</p>
            ) : (
                <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
                    {projects.map((project) => (
                        <li key={project.id} className="flex flex-wrap items-center gap-3 bg-white/[0.02] px-4 py-3">
                            <i aria-hidden="true" className="fas fa-diagram-project text-xs text-gray-500" />
                            <Link href={route('projects.show', project.id)} className="min-w-0 flex-1 truncate font-medium text-white hover:underline">
                                {project.name}
                            </Link>
                            <RoleBadge role={project.role} />
                            <button type="button" onClick={() => setSharing(project)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white">
                                {['owner', 'manager'].includes(project.role) ? 'Share…' : 'Members…'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {sharing && <SharePanel show project={sharing} onClose={() => setSharing(null)} />}
        </SettingsCard>
    );
}

const WORKSPACE_LINKS = [
    { label: 'WhatsApp integration', help: 'Connection, numbers and test messages', icon: 'fa-plug', route: 'whatsapp.settings' },
    { label: 'Users', help: 'Who has an account, and their roles', icon: 'fa-users-cog', route: 'users.index' },
    { label: 'Analytics', help: 'Spending and activity across projects', icon: 'fa-chart-bar', route: 'analytics' },
    { label: 'Activity logs', help: 'Changes and sign-ins', icon: 'fa-history', route: 'activity.logs' },
];

/** Admins: the workspace-wide pages, in one place. */
function WorkspaceSection() {
    return (
        <SettingsCard icon="fa-building" title="Workspace" description="Settings that apply to everyone, for admins.">
            <div className="grid gap-3 sm:grid-cols-2">
                {WORKSPACE_LINKS.map((link) => (
                    <Link
                        key={link.route}
                        href={route(link.route)}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                            <i aria-hidden="true" className={`fas ${link.icon}`} />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-white">{link.label}</span>
                            <span className="block text-xs text-gray-400">{link.help}</span>
                        </span>
                        <i aria-hidden="true" className="fas fa-chevron-right ml-auto text-xs text-gray-500" />
                    </Link>
                ))}
            </div>
        </SettingsCard>
    );
}

/** The section in the address (?section=…), so a link or reload lands on it. */
function useSection(sections, initial) {
    const [active, setActive] = useState(() => (sections.some((s) => s.id === initial) ? initial : sections[0].id));
    const show = (id) => {
        setActive(id);
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('section', id);
            window.history.replaceState(window.history.state, '', url);
        } catch {
            /* no history (tests) */
        }
        window.scrollTo?.({ top: 0 });
    };
    return [active, show];
}

export default function Edit({ mustVerifyEmail, status, whatsapp = {}, twoFactor = {}, passkeys = [], preferences = {}, section }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const projects = auth.projects ?? [];
    const [loginAlerts, setLoginAlerts] = useState(Boolean(user.login_notifications_enabled));

    const toggleNotifications = useAction((enabled) => visit('patch', route('profile.login-notifications'), { enabled }), {
        key: () => 'notifications',
        // Undo the optimistic switch when the save fails.
        onError: (err, enabled) => setLoginAlerts(!enabled),
    });
    const toggleLoginAlerts = (enabled) => {
        setLoginAlerts(enabled);
        toggleNotifications.run(enabled);
    };

    const sections = settingsSections({ isAdmin: user.role === 'admin', twoFactor, passkeys, whatsapp, loginAlerts, projects });
    const [active, show] = useSection(sections, section);
    const current = sections.find((s) => s.id === active);

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <DashboardPage
                className="mx-auto max-w-6xl"
                hero={{
                    title: 'Settings',
                    subtitle: 'Your account, security, connections and preferences',
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Settings' }],
                }}
                panel={{
                    id: 'settings',
                    title: 'Settings',
                    icon: 'fa-gear',
                    subtitle: user.email,
                    items: sections,
                    activeId: active,
                    onChange: show,
                    footer: 'Changes to switches and preferences save as you make them. Forms save with their own button.',
                }}
            >
                <div className="space-y-6" aria-label={current.label} role="region">
                    {active === 'profile' && (
                        <SettingsCard>
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </SettingsCard>
                    )}

                    {active === 'password' && (
                        <SettingsCard>
                            <UpdatePasswordForm />
                        </SettingsCard>
                    )}

                    {active === 'two-factor' && (
                        <SettingsCard icon="fa-shield-halved" title="Two-factor sign-in" description="Ask for a code from an authenticator app as well as your password.">
                            <TwoFactorAuthenticationForm twoFactor={twoFactor} />
                        </SettingsCard>
                    )}

                    {active === 'passkeys' && (
                        <SettingsCard icon="fa-fingerprint" title="Passkeys" description="Sign in with your fingerprint, face or a security key instead of a password.">
                            <PasskeysForm passkeys={passkeys} />
                        </SettingsCard>
                    )}

                    {active === 'sign-in' && (
                        <SettingsCard icon="fa-bell" title="Sign-in alerts" description="Ways in, and what we tell you about them.">
                            <div className="space-y-3">
                                <SwitchRow
                                    id="login-alerts"
                                    icon="fa-shield-alt"
                                    label="Email me about new devices"
                                    help="Get an email when your account is signed into from a device we haven't seen before."
                                    checked={loginAlerts}
                                    onChange={toggleLoginAlerts}
                                />
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                                            <i aria-hidden="true" className="fas fa-envelope-open-text" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-white">Sign in with an emailed code</p>
                                            <p className="text-xs text-gray-400">A one-time code sent to {user.email} works instead of your password.</p>
                                        </div>
                                    </div>
                                    <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Available</span>
                                </div>
                            </div>
                        </SettingsCard>
                    )}

                    {active === 'whatsapp' && <WhatsAppSection whatsapp={whatsapp} />}

                    {active === 'preferences' && <PreferencesSection preferences={preferences} />}

                    {active === 'projects' && <ProjectsSection projects={projects} />}

                    {active === 'workspace' && <WorkspaceSection />}

                    {active === 'delete' && (
                        <SettingsCard tone="danger">
                            <DeleteUserForm />
                        </SettingsCard>
                    )}
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
