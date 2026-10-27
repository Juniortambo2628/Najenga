import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListPanel from '../../../resources/js/Components/ListPanel';

describe('ListPanel', () => {
    it('pins the header and footer around a scrolling body', () => {
        const { container } = render(
            <ListPanel header={<p>Head</p>} footer={<p>Foot</p>}>
                <p>Rows</p>
            </ListPanel>,
        );
        const body = container.querySelector('[data-scroll-region]');
        expect(body).toHaveTextContent('Rows');
        expect(body).not.toHaveTextContent('Head');
        expect(body).not.toHaveTextContent('Foot');
        expect(body.className).toContain('fit:overflow-y-auto');
        expect(screen.getByText('Head')).toBeInTheDocument();
        expect(screen.getByText('Foot')).toBeInTheDocument();
    });

    it('drops the panel chrome when plain', () => {
        const { container, rerender } = render(<ListPanel>x</ListPanel>);
        expect(container.firstChild.className).toContain('panel');
        rerender(<ListPanel plain>x</ListPanel>);
        expect(container.firstChild.className).not.toContain('panel');
    });
});
