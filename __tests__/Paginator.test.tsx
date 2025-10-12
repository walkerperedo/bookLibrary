import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Paginator from '@/components/Paginator';

const replace = jest.fn();
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ replace }),
    useSearchParams: () => new URLSearchParams('q=the&page=3'),
  };
});

describe('Paginator', () => {
  beforeEach(() => replace.mockClear());

  it('goes to previous page', async () => {
    render(<Paginator hasNext={true} />);
    await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    const to = replace.mock.calls.at(-1)?.[0] as string;
    expect(to).toContain('page=2');
  });

  it('goes to next page', async () => {
    render(<Paginator hasNext={true} />);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    const to = replace.mock.calls.at(-1)?.[0] as string;
    expect(to).toContain('page=4');
  });
});
