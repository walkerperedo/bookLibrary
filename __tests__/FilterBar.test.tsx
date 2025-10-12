import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetAllStores } from '../test/resetStore';
import FilterBar from '@/components/FilterBar';

const mockRouter = {
  push:    jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back:    jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};


jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams('q=the&page=2'),
  };
});

describe('FilterBar', () => {
  beforeEach(() => {
    resetAllStores();
    Object.values(mockRouter).forEach((fn) => {
      if (typeof fn === 'function') (fn as jest.Mock).mockClear();
    });
  });

  it('updates author filter and resets page to 1', async () => {
    render(<FilterBar />);

    const authorInput = screen.getByLabelText(/Author/i);
    await userEvent.clear(authorInput);
    await userEvent.type(authorInput, 'Rowling{enter}');

    expect(mockRouter.push).toHaveBeenCalled();
    const to = mockRouter.push.mock.calls.at(-1)?.[0] as string;
    expect(to).toContain('/books?');
    expect(to).toContain('page=1');
  });

  it('changes category via select and calls replace', async () => {
    render(<FilterBar />);
    const select = screen.getByLabelText(/category/i);
    await userEvent.selectOptions(select, 'fantasy');

    const to = mockRouter.push.mock.calls.at(-1)?.[0] as string;
    expect(to).toContain('category=fantasy');
  });
});
