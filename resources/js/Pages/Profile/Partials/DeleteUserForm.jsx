import InputError from '@/Components/InputError';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-white">
                    Delete Account
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <Button variant="danger" onClick={confirmUserDeletion}>
                Delete Account
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-2">
                        Are you sure you want to delete your account?
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mb-6">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={deleteUser} disabled={processing}>
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
