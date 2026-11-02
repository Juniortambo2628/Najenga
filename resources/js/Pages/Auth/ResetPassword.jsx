import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { ResetPasswordPage } from '@okjt/dashboard';
import KitAuth, { authLayout } from '@/Layouts/KitAuth';

const Layout = authLayout({ stepKey: 'reset', showcase: ['Create New Password', 'Choose a strong password to secure your account.'] });

/** Where the reset link lands (the kit's ResetPasswordPage); then on to sign in. */
export default function ResetPassword({ token, email }) {
    return (
        <KitAuth>
            <Head title="Reset Password - Najenga" />
            <ResetPasswordPage
                layout={Layout}
                token={token}
                email={email ?? ''}
                title="Reset Password"
                subtitle="Enter your new password below."
                idPrefix="reset"
                submitLabel="Reset Password"
                footer={
                    <Link href={route('login')} className="text-[#1A1514] font-semibold hover:underline">
                        Back to Sign In
                    </Link>
                }
                onReset={(result) => {
                    toast.success(result.message || 'Your password has been reset.');
                    router.visit(route('login'));
                }}
            />
        </KitAuth>
    );
}
