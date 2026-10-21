import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import type { Value } from 'react-phone-number-input';
import { describe, expect, it } from 'vitest';
import { DeferredPhoneNumberInput } from './deferred-phone-number-input';

function ControlledPhone() {
  const [value, setValue] = useState<Value | undefined>('+16109988971' as Value);
  return <DeferredPhoneNumberInput id="deferred-phone" name="phone" label="Phone" value={value} onChange={setValue} />;
}

describe('deferred phone widget', () => {
  it('keeps a focused field and its value until blur, then upgrades to country formatting', async () => {
    render(<ControlledPhone />);
    const fallback = screen.getByRole('textbox', { name: 'Phone' });
    fireEvent.focus(fallback);
    fireEvent.change(fallback, { target: { value: '+1 610 998 8972' } });
    await act(async () => { await import('./phone-number-input'); });
    expect(screen.getByRole('textbox', { name: 'Phone' })).toBe(fallback);
    expect(fallback).toHaveValue('+16109988972');
    expect(screen.queryByRole('combobox', { name: 'Phone number country' })).not.toBeInTheDocument();
    fireEvent.blur(fallback);
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Phone number country' })).toHaveValue('US'));
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('+1 610 998 8972');
  });
});
