import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceFormFields from '../../../resources/js/Components/ResourceFormFields';
import { PROJECT_FIELDS } from '../../../resources/js/Config/schemas/project';
import { computeDefaults } from '../../../resources/js/Config/fieldBuilder';

describe('ResourceFormFields', () => {
    it('renders top-level field() builders as named, labelled inputs', () => {
        render(<ResourceFormFields schema={PROJECT_FIELDS} data={computeDefaults(PROJECT_FIELDS)} setData={vi.fn()} errors={{}} />);
        const name = screen.getByLabelText(/Project Name/);
        expect(name).toHaveAttribute('id', 'field-name');
        expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA');
        expect(document.getElementById('field-undefined')).toBeNull();
    });

    it('sets the field it belongs to when typed into', () => {
        const setData = vi.fn();
        render(<ResourceFormFields schema={PROJECT_FIELDS} data={computeDefaults(PROJECT_FIELDS)} setData={setData} errors={{}} />);
        fireEvent.change(screen.getByLabelText(/Project Name/), { target: { value: 'Ruiru warehouse' } });
        expect(setData).toHaveBeenCalledWith('name', 'Ruiru warehouse');
    });
});
