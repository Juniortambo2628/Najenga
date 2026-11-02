import { Head } from '@inertiajs/react';
import { ConfirmPasswordPage } from '@okjt/dashboard';
import KitAuth, { authLayout } from '@/Layouts/KitAuth';

const Layout = authLayout({ stepKey: 'confirm', showcase: ['Confirm Your Password', 'This is a secure area. Please confirm your password.'] });

/** Typing the password again before something sensitive (the kit's ConfirmPasswordPage). */
export default function ConfirmPassword() {
    return (
        <KitAuth>
            <Head title="Confirm Password - Najenga" />
            <ConfirmPasswordPage
                layout={Layout}
                title="Secure Area"
                subtitle="Please confirm your password before continuing."
                submitLabel="Confirm Password"
                idPrefix="confirm"
                onConfirmed={() => window.history.length > 1 ? window.history.back() : window.location.assign(route('dashboard'))}
            />
        </KitAuth>
    );
}
