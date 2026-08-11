import Button from '@/Components/Button';

export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <Button variant="danger" className={className} disabled={disabled} {...props}>
            {children}
        </Button>
    );
}
