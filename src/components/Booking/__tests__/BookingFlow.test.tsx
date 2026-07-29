import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingFlow from '../BookingFlow';

vi.mock('../../../stores/bookingStore', () => ({
  default: vi.fn((selector) =>
    selector({
      createBooking: vi.fn(),
      addRecentSearch: vi.fn(),
      bookingHistory: [
        { id: 'BK-001', route: 'Umuahia → Aba', date: '2024-03-14', time: '08:30', seats: ['A12'], fare: 350, status: 'completed', bus: 'AB-101' },
      ],
      savedRoutes: [],
    })
  ),
}));

vi.mock('../../../stores/walletStore', () => ({
  default: vi.fn((selector) =>
    selector({
      balance: 50000,
      deductFunds: vi.fn(),
    })
  ),
}));

vi.mock('../../../stores/notificationStore', () => ({
  default: vi.fn((selector) =>
    selector({
      showNotification: vi.fn(),
    })
  ),
}));

describe('BookingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 1 (Search) by default', () => {
    render(
      <BookingFlow>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BookingFlow.Main />
          <BookingFlow.Sidebar />
        </div>
      </BookingFlow>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders sidebar with SavedRoutes', () => {
    render(
      <BookingFlow>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BookingFlow.Main />
          <BookingFlow.Sidebar />
        </div>
      </BookingFlow>
    );
    expect(screen.getByText(/Special Offers/)).toBeInTheDocument();
  });

  it('renders travel tips in sidebar', () => {
    render(
      <BookingFlow>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BookingFlow.Main />
          <BookingFlow.Sidebar />
        </div>
      </BookingFlow>
    );
    expect(screen.getByText('Travel Tips')).toBeInTheDocument();
  });

  it('shows step 4 step label', () => {
    render(
      <BookingFlow>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BookingFlow.Main />
          <BookingFlow.Sidebar />
        </div>
      </BookingFlow>
    );
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });
});
