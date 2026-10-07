import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardHero from '@/Components/DashboardHero';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { rootBreadcrumbs } from '@/Config/navigation';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [loginNotificationsEnabled, setLoginNotificationsEnabled] = useState(
        Boolean(user.login_notifications_enabled)
    );

    const toggleLoginNotifications = (enabled) => {
        setLoginNotificationsEnabled(enabled);
        router.patch(
            route('profile.login-notifications'),
            { enabled },
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto">
                <DashboardHero
                    title="Settings"
                    subtitle="Manage your account settings and preferences"
                    breadcrumbs={[
                        ...rootBreadcrumbs(),
                        { label: 'Settings' },
                    ]}
                />

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

                    {/* Two-Factor Authentication */}
                    <section className="panel p-6">
                        <header className="mb-6">
                            <h2 className="text-lg font-bold text-white">Two-Factor Authentication</h2>
                            <p className="text-sm text-gray-400 mt-1">Add additional security to your account using two-factor authentication.</p>
                        </header>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <i className="fas fa-mobile-alt text-blue-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Authenticator App</p>
                                        <p className="text-gray-500 text-xs">Use an authenticator app to generate one-time codes</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">Not Enabled</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <i className="fas fa-key text-green-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Recovery Codes</p>
                                        <p className="text-gray-500 text-xs">Store recovery codes in a safe place if you lose access</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">Unavailable</span>
                            </div>
                        </div>
                    </section>

                    {/* Security Preferences */}
                    <section className="panel p-6">
                        <header className="mb-6">
                            <h2 className="text-lg font-bold text-white">Security Preferences</h2>
                            <p className="text-sm text-gray-400 mt-1">Configure additional security settings for your account.</p>
                        </header>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <i className="fas fa-fingerprint text-purple-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Passkeys</p>
                                        <p className="text-gray-500 text-xs">Use biometrics or security keys to sign in</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">Coming Soon</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <i className="fas fa-envelope-open-text text-orange-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Sign in with Login Code</p>
                                        <p className="text-gray-500 text-xs">Receive a one-time code via email to sign in</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Available</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <i className="fas fa-shield-alt text-cyan-400"></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Login Notifications</p>
                                        <p className="text-gray-500 text-xs">Get notified when a new device signs into your account</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={loginNotificationsEnabled}
                                        onChange={(e) => toggleLoginNotifications(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DC143C]"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Delete Account */}
                    <section className="panel border-red-500/10 p-6">
                        <DeleteUserForm />
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
