import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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
import FloatingToolbar from '@/Components/FloatingToolbar';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return users.filter((user) => (
            (roleFilter === 'all' || user.role === roleFilter)
            && (statusFilter === 'all' || user.status === statusFilter)
            && (!q || [user.first_name, user.last_name, user.username, user.email]
                .some((field) => field?.toLowerCase().includes(q)))
        ));
    }, [users, searchQuery, roleFilter, statusFilter]);

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
                            <InputLabel htmlFor="users-first-name-2" value="First Name" />
                            <TextInput id="users-first-name-2" aria-invalid={!!errors.first_name} aria-describedby={errors.first_name ? 'users-first-name-2-error' : undefined} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                            <InputError id="users-first-name-2-error" message={errors.first_name} />
                        </div>
                        <div>
                            <InputLabel htmlFor="users-last-name-2" value="Last Name" />
                            <TextInput id="users-last-name-2" aria-invalid={!!errors.last_name} aria-describedby={errors.last_name ? 'users-last-name-2-error' : undefined} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                            <InputError id="users-last-name-2-error" message={errors.last_name} />
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
                        <InputLabel htmlFor="users-role-2" value="Role" />
                        <SelectInput
                            id="users-role-2"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="client">Client</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </SelectInput>
                    </div>
                    <div>
                        <InputLabel htmlFor="users-status" value="Status" />
                        <SelectInput
                            id="users-status"
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

            {/* Fits the screen on desktops: only the table's rows scroll. */}
            <div className={filteredUsers.length > 0 ? 'fit:h-[calc(100dvh-12rem)] fit:flex fit:flex-col' : ''}>
            <DashboardHero
                title="User Management"
                subtitle="Manage platform users and their roles"
                breadcrumbs={[
                    ...rootBreadcrumbs(),
                    { label: 'Users' },
                ]}
            />

            <FloatingToolbar
                search={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search users' }}
                filters={[
                    {
                        name: 'role',
                        title: 'Role',
                        value: roleFilter,
                        onChange: setRoleFilter,
                        options: [
                            { value: 'all', label: 'All Roles' },
                            { value: 'admin', label: 'Admin' },
                            { value: 'manager', label: 'Manager' },
                            { value: 'client', label: 'Client' },
                        ],
                    },
                    {
                        name: 'status',
                        title: 'Status',
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'all', label: 'All Statuses' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' },
                        ],
                    },
                ]}
                actions={[{ id: 'add', label: 'Add User', icon: 'fa-plus', href: route('users.create'), variant: 'primary' }]}
                selection={{
                    count: selectedCount,
                    total: filteredUsers.length,
                    onSelectAll: () => selectAll(filteredUsers.map(u => u.id)),
                    onDeselectAll: deselectAll,
                    actions: [{ id: 'delete', label: 'Delete Selected', icon: 'fa-trash', variant: 'danger', onClick: handleBulkDelete }],
                }}
            />

            <div className="panel overflow-hidden fit:flex-1 fit:min-h-0 fit:flex fit:flex-col">
                <div className="overflow-x-auto fit:flex-1 fit:min-h-0 fit:overflow-y-auto overscroll-contain">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10 bg-surface-panel">
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedCount === filteredUsers.length && filteredUsers.length > 0}
                                        aria-label="Select all users"
                                        onChange={() => selectedCount === filteredUsers.length ? deselectAll() : selectAll(filteredUsers.map(u => u.id))}
                                        className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`border-b border-white/5 hover:bg-white/5 transition ${isSelected(user.id) ? 'bg-white/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected(user.id)}
                                            onChange={() => toggleSelection(user.id, true)}
                                            aria-label={`Select ${user.name}`}
                                            className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
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
                                            <button onClick={() => handleEdit(user)} aria-label={`Edit ${user.name}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                                <i aria-hidden="true" className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(user)} aria-label={`Delete ${user.name}`} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                                                <i aria-hidden="true" className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        {users.length === 0 ? 'No users found' : 'No users match your search or filters'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
