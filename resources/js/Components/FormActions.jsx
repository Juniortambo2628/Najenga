import PrimaryButton from '@/Components/PrimaryButton';
import CancelButton from '@/Components/CancelButton';

export default function FormActions({ cancelHref, cancelLabel = 'Cancel', submitLabel, processing = false, loadingText = 'Processing...' }) {
    return (
        <div className="flex justify-end gap-3 pt-4">
            <CancelButton href={cancelHref}>{cancelLabel}</CancelButton>
            <PrimaryButton type="submit" disabled={processing}>
                {processing ? loadingText : submitLabel}
            </PrimaryButton>
        </div>
    );
}
