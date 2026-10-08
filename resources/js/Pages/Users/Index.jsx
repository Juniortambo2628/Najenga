import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardHero from '@/Components/DashboardHero';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/StatusBadge';
import BulkActions from '@/Components/BulkActions';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useBulkDelete from '@/Hooks/useBulkDelete';
import { rootBreadcrumbs } from '@/Config/navigation';

export default function Index({ users }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'client',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    const resetForm = () => {
        setForm({ first_name: '', last_name: '', email: '', role: 'client', password: '' });
        setErrors({});
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        router.put(`/users/${editingUser.id}`, form, {
            onSuccess: () => { setShowEditModal(false); setEditingUser(null); resetForm(); toast.success('User updated'); },
            onError: (err) => setErrors(err),
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Delete ${user.first_name} ${user.last_name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const handleBulkDelete = useBulkDelete({
        selected: selectedItems,
        noun: 'user',
        path: (id) => `/users/${id}`,
        onDone: clearSelection,
        reload: ['users'],
    });

    const editModalTabs = [
        {
            label: 'Account',
            icon: 'fa-user',
            content: (
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="First Name" />
                            <TextInput value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                            <InputError message={errors.first_name} />
                        </div>
                        <div>
                            <InputLabel value="Last Name" />
                            <TextInput value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                            <InputError message={errors.last_name} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton type="button" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Update User</PrimaryButton>
                    </div>
                </form>
            ),
        },
        {
            label: 'Permissions',
            icon: 'fa-shield-alt',
            content: (
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <InputLabel value="Role" />
                        <SelectInput
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="client">Client</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </SelectInput>
                    </div>
                    <div>
                        <InputLabel value="Status" />
                        <SelectInput
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </SelectInput>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Role Permissions</h4>
                        <div className="space-y-2 text-xs text-gray-400">
                            {form.role === 'admin' && <p>Full access to all features, user management, and settings.</p>}
                            {form.role === 'manager' && <p>Can manage projects, expenses, documents, and team members.</p>}
                            {form.role === 'client' && <p>Can view assigned projects, upload photos, and submit expenses.</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton type="button" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Update User</PrimaryButton>
                    </div>
                </form>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <DashboardHero
                title="User Management"
                subtitle="Manage platform users and their roles"
                breadcrumbs={[
                    ...rootBreadcrumbs(),
                    { label: 'Users' },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <BulkActions
                            selectedCount={selectedCount}
                            totalCount={users.length}
                            onSelectAll={() => selectAll(users.map(u => u.id))}
                            onDeselectAll={deselectAll}
                            actions={
                                <button className="text-white hover:text-gray-200" title="Delete Selected" onClick={handleBulkDelete}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            }
                        />
                        <PrimaryButton as="link" href={route('users.create')}>
                            <i className="fas fa-plus mr-2"></i>Add User
                        </PrimaryButton>
                    </div>
                }
            />

            <div className="panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedCount === users.length && users.length > 0}
                                        onChange={() => selectedCount === users.length ? deselectAll() : selectAll(users.map(u => u.id))}
                                        className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
                                    />
                                </th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium">User</th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Email</th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Role</th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Joined</th>
                                <th className="px-6 py-4 text-gray-400 text-sm font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={`border-b border-white/5 hover:bg-white/5 transition ${isSelected(user.id) ? 'bg-white/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected(user.id)}
                                            onChange={() => toggleSelection(user.id)}
                                            className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center text-white font-bold text-sm">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    <Link href={route('users.show', user.id)} className="hover:text-[#DC143C] transition">
                                                        {user.first_name} {user.last_name}
                                                    </Link>
                                                </p>
                                                <p className="text-gray-500 text-sm">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={user.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal (Tabbed) */}
            <Modal
                show={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingUser(null); }}
                maxWidth="3xl"
                tabs={editModalTabs}
                title={editingUser ? `${editingUser.first_name} ${editingUser.last_name}` : 'Edit User'}
                subtitle="Edit Account"
            />
        </AuthenticatedLayout>
    );
}
