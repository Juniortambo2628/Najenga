import Button from '@/Components/Button';

export default function FormActions({ cancelHref, cancelLabel = 'Cancel', submitLabel, processing = false, loadingText = 'Processing...' }) {
    return (
        <div className="flex justify-end gap-3 pt-4">
            <Button as="link" variant="secondary" href={cancelHref}>{cancelLabel}</Button>
            <Button type="submit" disabled={processing}>
                {processing ? loadingText : submitLabel}
            </Button>
        </div>
    );
}
