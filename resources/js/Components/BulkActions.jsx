import Button from '@/Components/Button';

export default function BulkActions({ selectedCount, totalCount, onSelectAll, onDeselectAll, actions }) {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}>
                <i className={`fas ${selectedCount === totalCount ? 'fa-minus-circle' : 'fa-check-circle'} mr-1`}></i>
                {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-xs text-gray-400">{selectedCount} selected</span>
            {actions}
        </div>
    );
}
