import React from 'react';

const STATUS_STYLES = {
    completed: 'bg-green-500/10 text-green-400',
    active: 'bg-blue-500/10 text-blue-400',
    planning: 'bg-yellow-500/10 text-yellow-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    on_hold: 'bg-orange-500/10 text-orange-400',
    cancelled: 'bg-red-500/10 text-red-400',
    rejected: 'bg-red-500/10 text-red-400',
    paid: 'bg-green-500/10 text-green-400',
};

function formatStatus(status) {
    return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || 'bg-gray-500/10 text-gray-400';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
            {formatStatus(status)}
        </span>
    );
}
