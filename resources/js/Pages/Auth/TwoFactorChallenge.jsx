import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.login'), {
            onFinish: () => reset('code', 'recovery_code'),
        });
    };

    const toggle = () => {
        setUseRecovery((r) => !r);
        reset('code', 'recovery_code');
    };

    return (
        <GuestLayout
            stepKey="two-factor"
            title="One more step"
            subtitle="Two-factor authentication is on for this account."
        >
            <Head title="Two-Factor Authentication - Najenga" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Verify it's you</h2>
                <p className="text-gray-400 text-sm">
                    {useRecovery
                        ? 'Enter one of your recovery codes.'
                        : 'Enter the 6-digit code from your authenticator app.'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {useRecovery ? (
                    <div>
                        <InputLabel htmlFor="recovery_code" value="Recovery code" />
                        <TextInput
                            id="recovery_code"
                            name="recovery_code"
                            type="text"
                            autoComplete="one-time-code"
                            value={data.recovery_code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('recovery_code', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={errors.recovery_code} className="mt-2" />
                    </div>
                ) : (
                    <div>
                        <InputLabel htmlFor="code" value="Authentication code" />
                        <TextInput
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('code', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={toggle}
                        className="text-sm text-gray-400 hover:text-white underline"
                    >
                        {useRecovery ? 'Use authenticator app instead' : 'Use a recovery code instead'}
                    </button>

                    <PrimaryButton disabled={processing}>Continue</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
