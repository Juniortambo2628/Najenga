import { Head, router } from '@inertiajs/react';

// Headings and copy mirror resources/views/errors/*.blade.php so a visitor
// sees the same words whether the failure was served as HTML or as an
// Inertia page. The 403 blade prefers the exception's own message, which
// never reaches React - it falls back to the generic sentence there.
const MESSAGES = {
    403: {
        heading: 'Access denied',
        message: 'You do not have permission to view this page.',
    },
    404: {
        heading: 'Page not found',
        message: 'The page you are looking for does not exist, or it may have been moved.',
    },
    419: {
        heading: 'Session expired',
        message: 'Your session expired because the page was open too long. Reload to continue.',
    },
    500: {
        heading: 'Something went wrong',
        message: 'An unexpected error occurred. The problem has been logged - please try again.',
    },
    503: {
        heading: 'Maintenance in progress',
        message: 'We are performing scheduled maintenance. Please check back shortly.',
    },
};

const FALLBACK = {
    heading: 'Something went wrong',
    message: 'An unexpected error occurred.',
};

export default function Errors({ status = 500 }) {
    const { heading, message } = MESSAGES[status] || FALLBACK;

    return (
        <>
            <Head title={`${status} - ${heading}`} />

            <main className="min-h-screen flex items-center justify-center bg-black px-5 py-8 text-white">
                <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(26,5,8,0.8)] to-[rgba(10,1,2,0.8)] p-10 text-center backdrop-blur-xl">
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC143C]">{status}</div>
                    <h1 className="mt-2 text-3xl font-bold leading-tight">{heading}</h1>
                    <p className="mt-3 leading-relaxed text-gray-400">{message}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.get(route('home'))}
                            className="rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Back to home
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            Go back
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
