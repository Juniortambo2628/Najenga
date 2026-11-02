import { Head, Link } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { motion } from 'framer-motion';
import { SignInPage } from '@okjt/dashboard';
import KitAuth, { authLayout } from '@/Layouts/KitAuth';

const Layout = authLayout({ stepKey: 'login', showcase: ['Welcome Back', 'Sign in to access your projects and continue building.'] });

/** Where signing in finishes: the page the person was going to, else the dashboard. */
const goOn = (result) => window.location.assign(result.redirect || route('dashboard'));

/**
 * Signing in (the kit's SignInPage): a password and "remember me", a code
 * sent by email, or a passkey (laravel/passkeys); then a two-step code or a
 * recovery code when it's on.
 */
export default function Login({ status }) {
    const {
        verify,
        isLoading: passkeyLoading,
        error: passkeyError,
        isSupported: passkeySupported,
    } = usePasskeyVerify({
        autofill: true,
        onSuccess: (response) => {
            if (response.redirect) {
                window.location.href = response.redirect;
            }
        },
    });

    const passkey = passkeySupported ? (
        <div>
            <motion.button
                type="button"
                onClick={() => verify()}
                disabled={passkeyLoading}
                className="w-full h-12 px-5 rounded-full border border-[#E6DFD9] bg-white text-[#1A1514] text-sm font-medium hover:bg-[#F1ECE8] transition disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                {passkeyLoading ? 'Waiting for authenticator...' : 'Sign in with passkey'}
            </motion.button>
            {passkeyError && <p className="text-sm text-red-600 mt-2 text-center">{passkeyError}</p>}
        </div>
    ) : false;

    return (
        <KitAuth>
            <Head title="Login - Najenga" />
            <SignInPage
                layout={Layout}
                title="Sign In Account"
                subtitle="Enter your credentials to access your account."
                status={status}
                remember
                emailCode
                passkey={passkey}
                idPrefix="login"
                emailAutoComplete="username webauthn"
                labels={{ submit: 'Sign In', submitting: 'Please wait...', emailPlaceholder: 'eg. johnfrans@gmail.com', passwordPlaceholder: 'Enter your password', sendCode: 'Send Sign-In Code', verifyCode: 'Verify & Sign In' }}
                forgotHint={
                    <Link href={route('password.request')} className="text-sm text-[#6B5D58] hover:text-[#1A1514] transition">
                        Forgot password?
                    </Link>
                }
                footer={
                    <>
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-[#1A1514] font-semibold hover:underline">
                            Sign up
                        </Link>
                    </>
                }
                onSignedIn={goOn}
            />
        </KitAuth>
    );
}
