import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { rootBreadcrumbs } from '@/Config/navigation';
import { Head, Link, router } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import { useState } from 'react';
import { usePasskeyRegister } from '@laravel/passkeys/react';

export default function Passkeys({ passkeys }) {
    const [name, setName] = useState('');
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            router.reload({ only: ['passkeys'] });
        },
    });

    const remove = (id) => {
        router.delete(route('passkey.destroy', { passkey: id }), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Passkeys" />

            <DashboardPage
                className="max-w-4xl mx-auto"
                hero={{
                    title: 'Passkeys',
                    subtitle: 'Sign in with biometrics or security keys',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Settings', href: route('profile.edit') },
                        { label: 'Passkeys' },
                    ],
                }}
            >
                <div className="space-y-6">
                    <section className="panel p-6">
                        <header className="mb-6">
                            <h2 className="text-lg font-bold text-white">Register a passkey</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Add a passkey from this device to sign in without a password.
                            </p>
                        </header>

                        {isSupported ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    register(name);
                                }}
                                className="flex flex-wrap gap-3"
                            >
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Passkey name, eg. Work laptop"
                                    className="auth-input flex-1 min-w-[240px]"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !name}
                                    className="px-5 py-2.5 rounded-xl bg-[rgb(139,0,0)] text-white text-sm font-medium hover:bg-[rgb(160,20,20)] transition disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Waiting for authenticator...'
                                        : 'Add passkey'}
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-gray-400">
                                Passkeys are not supported in this browser.
                            </p>
                        )}

                        {error && (
                            <p className="text-sm text-red-400 mt-3">{error}</p>
                        )}
                    </section>

                    <section className="panel p-6">
                        <header className="mb-4">
                            <h2 className="text-lg font-bold text-white">
                                Your passkeys
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Passkeys registered on your account.
                            </p>
                        </header>
                        <div className="space-y-3">
                            {passkeys.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No passkeys registered yet.
                                </p>
                            )}
                            {passkeys.map((passkey) => (
                                <div
                                    key={passkey.id}
                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                            <i className="fas fa-fingerprint text-purple-400"></i>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {passkey.name}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                Added {passkey.created_at}
                                                {passkey.last_used_at
                                                    ? ` · Last used ${passkey.last_used_at}`
                                                    : ' · Never used'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(passkey.id)}
                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div>
                        <Link
                            href={route('profile.edit')}
                            className="text-sm text-gray-400 hover:text-white transition"
                        >
                            &larr; Back to settings
                        </Link>
                    </div>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
