import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4">
                    {/* Profile Information Card */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Update Password Card */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* Delete Account Card */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
