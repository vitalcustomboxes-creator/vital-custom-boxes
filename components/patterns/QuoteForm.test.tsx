import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuoteForm } from './QuoteForm';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('./use-product-options', () => ({ useProductOptions: () => ({ options: [], loading: false, failed: false, load: vi.fn() }) }));

describe('quote form destination fields', () => {
  it('provides separate, visibly labelled address and country fields with a US default', () => {
    render(<QuoteForm action={vi.fn()} />);
    const address = screen.getByRole('textbox', { name: /Shipping Address/ });
    const country = screen.getByRole('textbox', { name: /Shipping Country/ });
    expect(address).toHaveAttribute('name', 'address');
    expect(address).toHaveAttribute('maxlength', '300');
    expect(country).toHaveAttribute('name', 'country');
    expect(country).toHaveValue('United States');
    expect(address).toBeRequired();
    expect(country).toBeRequired();
  });
});
