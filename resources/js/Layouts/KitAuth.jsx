import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { AuthProvider } from '@okjt/dashboard';
import GuestLayout from '@/Layouts/GuestLayout';

/**
 * Najenga's sign-in pages on the OKJT kit's (SignInPage, ForgotPasswordPage
 * and the rest), talking to the kit's auth API (/api/login, …, session
 * mode) and dressed as before: GuestLayout's frame and showcase around them,
 * the form's heading above, and the light sign-in colours (.najenga-auth in
 * najenga.css) under the dashboard's dark ones.
 */

/** The kit's API client (axios-like, resolving to the response body). */
export const authApi = {
    get: (url) => axios.get(`/api${url}`, { headers: { Accept: 'application/json' } }).then((r) => r.data),
    post: (url, data) => axios.post(`/api${url}`, data, { headers: { Accept: 'application/json' } }).then((r) => r.data),
};

/** A refused form's messages, the first for each field. */
export function firstErrors(error) {
    const errors = error?.response?.data?.errors ?? {};
    const out = Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : messages]));
    if (!Object.keys(out).length) out.email = error?.response?.data?.message || 'Something went wrong. Try again.';
    return out;
}

/** The kit's sign-in state, in session mode, around one of the pages. */
export default function KitAuth({ children }) {
    // Who's signed in is in the page already (null on the sign-in pages).
    const user = usePage().props.auth?.user ?? null;
    return (
        <AuthProvider api={authApi} mode="session" initialUser={user}>
            <div className="najenga-auth">{children}</div>
        </AuthProvider>
    );
}

/**
 * The layout a kit page draws itself in: GuestLayout with this page's
 * showcase (`stepKey`, `showcase` [headline, line]), and the kit's title and
 * subtitle as the form's heading.
 */
export function authLayout({ stepKey, showcase: [headline, line] = [] }) {
    return function NajengaAuthLayout({ title, subtitle, children, footer }) {
        return (
            <GuestLayout stepKey={stepKey} title={headline} subtitle={line}>
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">{title}</h1>
                    {subtitle && <p className="text-[#6B5D58] text-sm">{subtitle}</p>}
                </div>
                {children}
                {footer && <div className="text-center text-[#6B5D58] text-sm mt-6">{footer}</div>}
            </GuestLayout>
        );
    };
}
