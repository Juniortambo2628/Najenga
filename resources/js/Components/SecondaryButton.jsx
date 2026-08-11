import Button from '@/Components/Button';

export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <Button variant="secondary" type={type} className={className} disabled={disabled} {...props}>
            {children}
        </Button>
    );
}
