import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import useAction, { visit } from '@/Hooks/useAction';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { rootBreadcrumbs } from '@/Config/navigation';
import LinkWhatsAppForm from './Partials/LinkWhatsAppForm';
import TwoFactorAuthenticationForm from './Partials/TwoFactorAuthenticationForm';
import PasskeysForm from './Partials/PasskeysForm';

export default function Edit({ mustVerifyEmail, status, passkeysCount, whatsapp, twoFactor, passkeys }) {
    const { auth, errors } = usePage().props;
    const user = auth.user;
    const [loginNotificationsEnabled, setLoginNotificationsEnabled] = useState(
        Boolean(user.login_notifications_enabled)
    );
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');

    const toggleNotifications = useAction((enabled) => visit('patch', route('profile.login-notifications'), { enabled }), {
        key: () => 'notifications',
        // Undo the optimistic switch when the save fails.
        onError: (err, enabled) => setLoginNotificationsEnabled(!enabled),
    });
    const toggleLoginNotifications = (enabled) => {
        setLoginNotificationsEnabled(enabled);
        toggleNotifications.run(enabled);
    };

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
    const verifyWhatsAppCode = (e) => {
        e.preventDefault();
        verifyCode.run(code);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <DashboardPage
                className="max-w-4xl mx-auto"
                hero={{
                    title: 'Settings',
                    subtitle: 'Manage your account settings and preferences',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Settings' },
                    ],
                }}
            >
                <div className="space-y-6">
                    {/* Profile Information */}
                    <section className="panel p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </section>

                    {/* Update Password */}
                    <section className="panel p-6">
                        <UpdatePasswordForm />
                    </section>

                    {/* WhatsApp Number */}
                    <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                        <LinkWhatsAppForm whatsapp={whatsapp} />
                    </section>

                    {/* Two-Factor Authentication */}
                    <section className="panel p-6">
                        <header className="mb-6">
                            <h2 className="text-lg font-bold text-white">Two-Factor Authentication</h2>
                            <p className="text-sm text-gray-400 mt-1">Add additional security to your account using two-factor authentication.</p>
                        </header>
                        <TwoFactorAuthenticationForm twoFactor={twoFactor} />
                    </section>

                    {/* WhatsApp Verification */}
                    <section className="panel p-6">
                        <header className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">WhatsApp Verification</h2>
                                <p className="text-sm text-gray-400 mt-1">Verify your WhatsApp number to receive receipts and alerts.</p>
                            </div>
                            {whatsapp.verified ? (
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Verified</span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">Not Verified</span>
                            )}
                        </header>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                {whatsapp.verified
                                    ? `${whatsapp.phone} can receive WhatsApp messages from Najenga.`
                                    : whatsapp.phone
                                        ? `We will send a 6-digit code to ${whatsapp.phone} on WhatsApp.`
                                        : 'Add a phone number to your profile before verifying WhatsApp.'}
                            </p>
                            {!whatsapp.verified && whatsapp.phone && !codeSent && (
                                <button
                                    type="button"
                                    onClick={sendWhatsAppCode}
                                    className="px-5 py-2.5 rounded-xl bg-[rgb(139,0,0)] text-white text-sm font-medium hover:bg-[rgb(160,20,20)] transition"
                                >
                                    Send verification code
                                </button>
                            )}
                            {!whatsapp.verified && whatsapp.phone && codeSent && (
                                <form onSubmit={verifyWhatsAppCode} className="flex flex-wrap items-center gap-3">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="6-digit code"
                                        className="auth-input w-40"
                                    />
                                    <button
                                        type="submit"
                                        disabled={code.length !== 6}
                                        className="px-5 py-2.5 rounded-xl bg-[rgb(139,0,0)] text-white text-sm font-medium hover:bg-[rgb(160,20,20)] transition disabled:opacity-50"
                                    >
                                        Verify
                                    </button>
                                    <button
                                        type="button"
                                        onClick={sendWhatsAppCode}
                                        className="text-sm text-gray-400 hover:text-white transition"
                                    >
                                        Resend code
                                    </button>
                                </form>
                            )}
                            <InputError
                                message={errors?.whatsapp || errors?.code}
                                className="mt-1"
                            />
                        </div>

                    </section>

                    {/* Security Preferences */}
                    <section className="panel p-6">
                        <header className="mb-6">
                            <h2 className="text-lg font-bold text-white">Security Preferences</h2>
                            <p className="text-sm text-gray-400 mt-1">Configure additional security settings for your account.</p>
                        </header>
                        <PasskeysForm passkeys={passkeys} />
                        <div className="space-y-4">
                            <Link
                                href={route('profile.passkeys')}
                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <i className="fas fa-fingerprint text-purple-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Passkeys</p>
                                        <p className="text-gray-500 text-xs">Use biometrics or security keys to sign in</p>
                                    </div>
                                </div>
                                {passkeysCount > 0 ? (
                                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                        {passkeysCount} {passkeysCount === 1 ? 'Passkey' : 'Passkeys'}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">None yet</span>
                                )}
                            </Link>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <i aria-hidden="true" className="fas fa-envelope-open-text text-orange-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Sign in with Login Code</p>
                                        <p className="text-gray-400 text-xs">Receive a one-time code via email to sign in</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Available</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <i aria-hidden="true" className="fas fa-shield-alt text-cyan-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Login Notifications</p>
                                        <p className="text-gray-400 text-xs">Get notified when a new device signs into your account</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={loginNotificationsEnabled}
                                        onChange={(e) => toggleLoginNotifications(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DC143C]"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Delete Account */}
                    <section className="panel border-red-500/10 p-6">
                        <DeleteUserForm />
                    </section>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
