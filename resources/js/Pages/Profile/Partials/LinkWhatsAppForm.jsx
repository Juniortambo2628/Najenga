import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function LinkWhatsAppForm({ whatsapp = {} }) {
    const { wa_id, verified_at, configured } = whatsapp;
    const [phone, setPhone] = useState(wa_id ? '+' + wa_id : '');
    const [code, setCode] = useState('');
    const [stage, setStage] = useState(verified_at ? 'linked' : 'idle'); // idle | sent | linked
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [maskedPhone, setMaskedPhone] = useState(null);

    const sendCode = async (e) => {
        e.preventDefault();
        if (!configured) {
            toast.error('WhatsApp is not configured on the server.');
            return;
        }
        setSending(true);
        try {
            const { data } = await axios.post('/profile/whatsapp/send-code', { phone });
            setMaskedPhone(data.phone_masked);
            setStage('sent');
            toast.success(`Code sent to ${data.phone_masked}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not send code');
        } finally {
            setSending(false);
        }
    };

    const verify = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            await axios.post('/profile/whatsapp/verify', { code });
            toast.success('WhatsApp number linked');
            setStage('linked');
            setCode('');
            router.reload({ only: ['whatsapp'] });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid code');
        } finally {
            setVerifying(false);
        }
    };

    const unlink = async () => {
        if (!confirm('Unlink your WhatsApp number?')) return;
        try {
            await axios.delete('/profile/whatsapp');
            toast.success('Unlinked');
            setStage('idle');
            setPhone('');
            router.reload({ only: ['whatsapp'] });
        } catch (err) {
            toast.error('Could not unlink');
        }
    };

    return (
        <div>
            <header className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <i aria-hidden="true" className="fab fa-whatsapp text-green-400"></i>
                    WhatsApp Number
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                    Link your WhatsApp number to send receipts and get replies from the Najenga bot.
                </p>
            </header>

            {stage === 'linked' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium text-sm">
                            Linked: <span className="font-mono">+{wa_id}</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Verified {verified_at ? new Date(verified_at).toLocaleString() : ''}
                        </p>
                    </div>
                    <button onClick={unlink} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs">
                        Unlink
                    </button>
                </div>
            )}

            {stage !== 'linked' && (
                <div className="space-y-3">
                    {!configured && (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                            WhatsApp is not configured on the server yet. An admin needs to complete the Meta setup at <code>/whatsapp</code>.
                        </div>
                    )}

                    <form onSubmit={sendCode} className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="tel"
                            autoComplete="tel"
                            aria-label="WhatsApp phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+2547XXXXXXXX"
                            required
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                        />
                        <button
                            type="submit"
                            disabled={sending || !configured}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#DC143C] text-white font-semibold disabled:opacity-50"
                        >
                            {sending ? 'Sending…' : stage === 'sent' ? 'Resend code' : 'Send code'}
                        </button>
                    </form>

                    {stage === 'sent' && (
                        <form onSubmit={verify} className="flex flex-col sm:flex-row gap-2">
                            <input
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                aria-label="6-digit verification code"
                                pattern="\d{6}"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="6-digit code"
                                required
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 tracking-widest text-center font-mono focus:outline-none focus:border-white/30"
                            />
                            <button
                                type="submit"
                                disabled={verifying || code.length !== 6}
                                className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold disabled:opacity-50"
                            >
                                {verifying ? 'Verifying…' : 'Verify'}
                            </button>
                        </form>
                    )}

                    {stage === 'sent' && maskedPhone && (
                        <p className="text-xs text-gray-400">
                            We sent a 6-digit code to <span className="text-white font-mono">{maskedPhone}</span>. It expires in 10 minutes.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
