import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PhoneNumberInput } from './phone-number-input';

describe('PhoneNumberInput', () => {
  it('keeps its label, selected country flag and E.164 change value', () => {
    const onChange = vi.fn();
    render(<PhoneNumberInput name="phone" label="Phone" value={'+16109988971'} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Phone' });
    expect(input).toHaveValue('+1 610 998 8971');
    expect(screen.getByRole('combobox', { name: 'Phone number country' })).toHaveValue('US');
    fireEvent.change(input, { target: { value: '+1 610 998 8972' } });
    expect(onChange).toHaveBeenLastCalledWith('+16109988972');
  });
});
