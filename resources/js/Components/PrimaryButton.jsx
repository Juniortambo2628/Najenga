import Button from '@/Components/Button';

export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <Button variant="primary" className={className} disabled={disabled} {...props}>
            {children}
        </Button>
    );
}
