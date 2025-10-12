import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BookCard from '@/components/BookCard'
import { useInventory } from '@/modules/inventory/store/inventory.store'
import { useUser } from '@/modules/users/store/user.store'
import { resetAllStores } from '../test/resetStore'

jest.mock('@/hooks/useHydrated', () => ({ useHydrated: () => true }))

jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
})

describe('BookCard', () => {
  beforeEach(() => {
    resetAllStores()
    useUser.setState({ user: { id: 1, name: 'John', email: 'john@mail.com', avatar: '' } } as any)
  })

  const book = {
    id: '/works/OL123W',
    title: 'Clean Code',
    authors: ['Robert C. Martin'],
    coverUrl: undefined,
  }

  it('shows Borrow when available, then Return after borrowing', async () => {
    render(<BookCard b={book as any} />)

    const borrowBtn = await screen.findByRole('button', { name: /borrow/i })
    expect(borrowBtn).toBeInTheDocument()

    await userEvent.click(borrowBtn)

    // Borrow hides, Return appears
    expect(screen.queryByRole('button', { name: /borrow/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /return/i })).toBeInTheDocument()

    // Inventory should now mark as ON_LOAN by John
    const inv = useInventory.getState().items['/works/OL123W']
    expect(inv?.status).toBe('ON_LOAN')
    expect(inv?.loanedBy).toBe('user:1')
  })

  it('shows Reserve for a different user when already on loan', async () => {
    // Simulate someone else has it
    useInventory.setState({
      items: {
        '/works/OL777W': {
          id: '/works/OL777W',
          status: 'ON_LOAN',
          loanedBy: 'user:999',
          loanedAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
      },
    } as any)

    const b = { ...book, id: '/works/OL777W', title: 'Refactoring' }
    render(<BookCard b={b as any} />)

    expect(screen.queryByRole('button', { name: /borrow/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reserve/i })).toBeInTheDocument()
  })
})
