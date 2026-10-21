import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { LeadForm } from './LeadForm';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
}));

describe('contact/sample lead form', () => {
  const scrollIntoView = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView',
  );

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterAll(() => {
    if (scrollIntoView) {
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollIntoView',
        scrollIntoView,
      );
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    }
  });

  it(
    'keeps phone country detection, confirmation and submitted values after code splitting',
    { timeout: 15_000 },
    async () => {
      const action = vi
        .fn<(formData: FormData) => Promise<{ ok: boolean }>>()
        .mockResolvedValue({ ok: true });

      render(
        <LeadForm
          action={action}
          idPrefix="contact-test"
          submitLabel="Send request"
          fields={[
            { kind: 'phone', name: 'phone', label: 'Phone' },
            {
              kind: 'country',
              name: 'country',
              label: 'Country',
              required: true,
            },
          ]}
        />,
      );

      await screen.findByRole(
        'combobox',
        { name: 'Phone number country' },
        { timeout: 10_000 },
      );

      fireEvent.change(screen.getByRole('textbox', { name: 'Phone' }), {
        target: { value: '+1 610 998 8971' },
      });

      await waitFor(() =>
        expect(
          screen.getByRole('combobox', { name: 'Country' }),
        ).toHaveValue('United States'),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

      expect(action).not.toHaveBeenCalled();

      fireEvent.click(
        await screen.findByRole('button', { name: 'Confirm and send' }),
      );

      await waitFor(() => expect(action).toHaveBeenCalledTimes(1));

      const form = action.mock.calls[0][0];

      expect(form.get('phone')).toBe('+16109988971');
      expect(form.get('country')).toBe('United States');
      expect(form.get('website')).toBe('');

      await waitFor(() =>
        expect(navigation.push).toHaveBeenCalledWith('/thank-you/'),
      );
    },
  );

  it('does not send a country calling code as an optional phone number', async () => {
    const action = vi
      .fn<(formData: FormData) => Promise<{ ok: boolean }>>()
      .mockResolvedValue({ ok: true });

    render(
      <LeadForm
        action={action}
        idPrefix="sample-test"
        submitLabel="Request sample"
        fields={[
          { kind: 'phone', name: 'phone', label: 'Phone' },
          {
            kind: 'country',
            name: 'country',
            label: 'Country',
            required: true,
          },
        ]}
      />,
    );

    const country = screen.getByRole('combobox', { name: 'Country' });

    fireEvent.focus(country);
    fireEvent.change(country, {
      target: { value: 'United States' },
    });

    fireEvent.click(
      await screen.findByRole('option', { name: 'United States' }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Request sample' }),
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Confirm and send' }),
    );

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));

    expect(action.mock.calls[0][0].get('country')).toBe('United States');
    expect(action.mock.calls[0][0].get('phone')).toBe('');
  });
});