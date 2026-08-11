import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function ShareProjectModal({ show, onClose, project, teamMembers = [], onSuccess }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [loading, setLoading] = useState(false);

    const handleShare = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`/projects/${project.id}/share`, { email, role });
            toast.success('Member added');
            setEmail('');
            setRole('viewer');
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this member from the project?')) return;
        try {
            await axios.delete(`/projects/${project.id}/share/${userId}`);
            toast.success('Member removed');
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleClose = () => {
        setEmail('');
        setRole('viewer');
        onClose();
    };

    const tabs = [
        {
            label: 'Add Member',
            icon: 'fa-user-plus',
            content: (
                <form onSubmit={handleShare} className="space-y-5">
                    <div>
                        <p className="text-gray-400 text-sm mb-4">Invite a team member to <span className="text-white font-semibold">{project.name}</span></p>
                    </div>
                    <div>
                        <InputLabel value="Email Address" />
                        <div className="relative">
                            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                            <TextInput
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <InputLabel value="Role" />
                        <SelectInput value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="viewer">Viewer — Read only access</option>
                            <option value="editor">Editor — Can make changes</option>
                        </SelectInput>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton type="button" onClick={handleClose}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Member'}
                        </PrimaryButton>
                    </div>
                </form>
            ),
        },
    ];

    if (teamMembers.length > 0) {
        tabs.push({
            label: 'Team Members',
            icon: 'fa-users',
            content: (
                <div className="space-y-3">
                    {teamMembers.map((user) => {
                        const memberRole = user.pivot?.role || 'viewer';
                        const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        return (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center text-white font-bold text-sm">
                                        {(userName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{userName}</p>
                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${ROLE_COLORS[memberRole] || ROLE_COLORS.viewer}`}>
                                        {memberRole}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveMember(user.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                        title="Remove member"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        });
    }

    return (
        <Modal
            show={show}
            onClose={handleClose}
            maxWidth="3xl"
            tabs={tabs}
            title={project.name}
            subtitle="Share Project"
        />
    );
}
