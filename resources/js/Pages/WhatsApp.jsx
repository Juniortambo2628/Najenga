import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardHero from '@/Components/DashboardHero';
import { rootBreadcrumbs } from '@/Config/navigation';

const TOGGLES = [
    { key: 'expense_notifications', label: 'New Expense Added' },
    { key: 'project_notifications', label: 'Project Status Update' },
    { key: 'document_notifications', label: 'Document Uploaded' },
];

export default function WhatsApp({ connection, settings }) {
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [toggles, setToggles] = useState({
        expense_notifications: settings.expense_notifications,
        project_notifications: settings.project_notifications,
        document_notifications: settings.document_notifications,
    });

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch('/whatsapp/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
            });
            const data = await res.json();
            setTestResult(data);
        } catch {
            setTestResult({
                ok: false,
                message: 'The connection test failed. Please try again.',
            });
        } finally {
            setTesting(false);
        }
    };

    const toggle = (key, enabled) => {
        setToggles((current) => ({ ...current, [key]: enabled }));
        router.patch(
            route('whatsapp.settings'),
            { key, enabled },
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Integration" />

            <div>
                <div className="max-w-7xl mx-auto">
                    <DashboardHero
                        title="WhatsApp Integration"
                        subtitle="Manage WhatsApp notifications and settings"
                        breadcrumbs={[
                            ...rootBreadcrumbs(),
                            { label: 'WhatsApp' },
                        ]}
                    />

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <i className="fab fa-whatsapp text-green-400 text-2xl mr-3"></i>
                                Connection Status
                            </h3>
                            {connection.configured ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center mb-6">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                    <span className="text-green-400 font-medium">Configured</span>
                                </div>
                            ) : (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                        <span className="text-yellow-400 font-medium">Not Configured</span>
                                    </div>
                                    <p className="text-yellow-200/70 text-xs mt-2">
                                        Missing: {connection.missing.join(', ')}
                                    </p>
                                </div>
                            )}
                            <p className="text-gray-400 text-sm mb-6">
                                Test the configured credentials against Meta's WhatsApp API.
                            </p>
                            <button
                                type="button"
                                onClick={testConnection}
                                disabled={testing}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition disabled:opacity-50"
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </button>
                            {testResult && (
                                <p
                                    className={`mt-4 text-sm ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}
                                >
                                    {testResult.message}
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                {TOGGLES.map((setting) => (
                                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-gray-300">{setting.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={toggles[setting.key]}
                                                onChange={(e) => toggle(setting.key, e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8B0000] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
