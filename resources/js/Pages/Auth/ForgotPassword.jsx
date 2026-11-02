import { Head, Link } from '@inertiajs/react';
import { ForgotPasswordPage } from '@okjt/dashboard';
import KitAuth, { authLayout } from '@/Layouts/KitAuth';

const Layout = authLayout({ stepKey: 'forgot', showcase: ['Forgot Password?', "No worries! Enter your email and we'll send you a reset link."] });

/** Forgotten password (the kit's ForgotPasswordPage). */
export default function ForgotPassword() {
    return (
        <KitAuth>
            <Head title="Forgot Password - Najenga" />
            <ForgotPasswordPage
                layout={Layout}
                title="Reset Password"
                subtitle="Enter your email to receive a password reset link."
                submitLabel="Send Reset Link"
                idPrefix="forgot"
                footer={
                    <>
                        Remember your password?{' '}
                        <Link href={route('login')} className="text-[#1A1514] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </>
                }
            />
        </KitAuth>
    );
}
