import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import globals from '@/content/globals.json';
import { Header } from './Header';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => navigation }));

const categories = [{ slug: 'custom-candle-boxes', name: 'Custom Candle Boxes', navGroup: 'By Industry', imageUrl: '/candle.webp' }];

describe('Header navigation', () => {
  beforeEach(() => {
    navigation.push.mockClear();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('opens its category menu and closes it with Escape after loading animation features', async () => {
    render(<Header globals={globals} categories={categories} />);
    const trigger = screen.getByRole('button', { name: 'Boxes by industry' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getAllByRole('link', { name: /Custom Candle Boxes/ }).length).toBeGreaterThan(0));
    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('moves keyboard focus into a menu even when its code loads asynchronously', async () => {
    render(<Header globals={globals} categories={categories} />);
    expect(screen.queryByRole('link', { name: 'Custom Candle Boxes' })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Boxes by industry' }), { key: 'ArrowDown' });
    await waitFor(() => expect(screen.getByRole('link', { name: 'Custom Candle Boxes' })).toHaveFocus());
  });

  it('focuses the lazy search field and preserves search navigation', async () => {
    render(<Header globals={globals} categories={categories} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Search products' })[0]);
    const input = await screen.findByRole('searchbox', { name: 'Search products' });
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: 'kraft boxes' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(navigation.push).toHaveBeenCalledWith('/shop/?q=kraft%20boxes');
  });
});
