import Button from '@/Components/Button';

export default function CancelButton({ href, children = 'Cancel', className = '' }) {
    return (
        <Button as="link" href={href} variant="secondary" className={className}>
            {children}
        </Button>
    );
}
