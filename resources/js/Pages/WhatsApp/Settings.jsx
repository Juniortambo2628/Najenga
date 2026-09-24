import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Settings({ config = {} }) {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('Hello from Najenga!');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        setResult(null);
        try {
            const { data } = await axios.post('/whatsapp/settings/test-send', { phone, message });
            setResult({ ok: true, data });
            toast.success('Test message sent');
        } catch (err) {
            const payload = err.response?.data ?? { error: err.message };
            setResult({ ok: false, data: payload });
            toast.error(payload.error || 'Send failed');
        } finally {
            setSending(false);
        }
    };

    const Status = ({ id, ok, label }) => (
        <div id={id} className={`flex items-center gap-2 text-sm ${ok ? 'text-green-400' : 'text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {label}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Settings" />

            <div className="max-w-6xl mx-auto space-y-6">
                <DashboardHero
                    title="WhatsApp Integration"
                    subtitle="Meta WhatsApp Cloud API — configuration & test"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'WhatsApp', href: '/whatsapp' },
                        { label: 'Settings' },
                    ]}
                />

                {config.test_mode && (
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100 flex items-start gap-3">
                        <i aria-hidden="true" className="fas fa-flask mt-0.5 text-yellow-300"></i>
                        <div className="space-y-1">
                            <p className="font-semibold text-yellow-200">Test mode — 5-recipient limit</p>
                            <p className="text-yellow-100/90">
                                This Meta app hasn't been business-verified. Messages can only be sent to numbers you
                                add to Meta's test recipient list (max 5). Anyone else's WhatsApp will get nothing.
                                To lift this limit, register a business and complete Meta business verification.
                            </p>
                            {config.admin_wa_id ? (
                                <p className="text-yellow-100/80">Admin notifications go to <span className="font-mono">+{config.admin_wa_id}</span>.</p>
                            ) : (
                                <p className="text-yellow-100/80">Set <span className="font-mono">NAJENGA_ADMIN_WA_ID</span> in .env to receive admin alerts.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <i aria-hidden="true" className="fab fa-whatsapp text-green-400 text-xl mr-2"></i>
                            Configuration
                        </h2>
                        <div className="space-y-3 text-sm">
                            <Status id="whatsapp-config-status" ok={config.configured} label={config.configured ? 'Configured' : 'Not configured — set META_WHATSAPP_* env vars'} />
                            <dl className="space-y-3">
                                <Row k="App ID" v={config.app_id || '—'} />
                                <Row k="App Secret" v={config.app_secret_masked || '—'} />
                                <Row k="Access Token" v={config.access_token_masked || '—'} />
                                <Row k="Phone Number ID" v={config.phone_number_id || '—'} />
                                <Row k="Verify Token" v={config.verify_token_set ? 'set' : 'not set'} />
                                <Row k="Webhook URL" v={config.webhook_url || '—'} mono />
                            </dl>
                        </div>

                        <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 leading-relaxed">
                            <p className="font-semibold text-white mb-1">Setup steps</p>
                            <ol className="list-decimal ml-4 space-y-1">
                                <li>Create a Meta App with the "Connect with customers through WhatsApp" use case.</li>
                                <li>Copy Phone Number ID + generate a permanent System User token.</li>
                                <li>Set the callback URL above and your chosen verify token in Meta.</li>
                                <li>Subscribe to <code>messages</code> on the WABA.</li>
                                <li>Fill in <code>META_WHATSAPP_*</code> in production .env, then redeploy.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            <i aria-hidden="true" className="fas fa-paper-plane text-blue-400 mr-2"></i>
                            Test send
                        </h2>
                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label htmlFor="whatsapp-test-phone" className="block text-xs text-gray-400 mb-1">Recipient phone (E.164, e.g. +2547...)</label>
                                <input
                                    id="whatsapp-test-phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    placeholder="+2547XXXXXXXX"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                                />
                            </div>
                            <div>
                                <label htmlFor="whatsapp-test-message" className="block text-xs text-gray-400 mb-1">Message</label>
                                <textarea
                                    id="whatsapp-test-message"
                                    aria-describedby="whatsapp-test-window-hint"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sending || !config.configured}
                                aria-describedby={!config.configured ? 'whatsapp-config-status' : undefined}
                                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#DC143C] text-white font-semibold disabled:opacity-50"
                            >
                                {sending ? 'Sending…' : 'Send test message'}
                            </button>
                            <p id="whatsapp-test-window-hint" className="text-xs text-gray-400">
                                Free-form messages only work inside a 24h window after the user last messaged you. Outside that window, use a message template.
                            </p>
                        </form>

                        {result && (
                            <pre
                                tabIndex={0}
                                role="region"
                                aria-label={result.ok ? 'API response' : 'API error response'}
                                className={`mt-4 text-xs p-3 rounded-lg overflow-auto max-h-56 border ${result.ok ? 'border-green-500/30 bg-green-500/5 text-green-200' : 'border-red-500/30 bg-red-500/5 text-red-200'}`}>
{JSON.stringify(result.data, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Row({ k, v, mono }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-gray-400">{k}</dt>
            <dd className={`text-white text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{v}</dd>
        </div>
    );
}
