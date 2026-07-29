import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ABSINReceipt from '../ABSINReceipt';

const defaultReceipt = {
  transactionId: 'TXN-001',
  cardholder: 'Abuoma David',
  cardNumber: '1234',
  balanceAfter: 7450,
  pointsEarned: 500,
};

const defaultProps = {
  receipt: defaultReceipt,
  amount: 5000,
  rideDetails: { from: 'Umuahia', to: 'Aba', busId: 'AB-101', seats: ['1A', '1B'], passengers: 2 },
  onPrint: vi.fn(),
  onDone: vi.fn(),
};

describe('ABSINReceipt', () => {
  it('renders success message', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('shows transaction ID', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getAllByText(/TXN-001/).length).toBeGreaterThan(0);
  });

  it('shows route details', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getByText('Umuahia → Aba')).toBeInTheDocument();
  });

  it('shows total amount', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getByText('₦5,000')).toBeInTheDocument();
  });

  it('shows balance after payment', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getByText('₦7,450')).toBeInTheDocument();
  });

  it('shows points earned', () => {
    render(<ABSINReceipt {...defaultProps} />);
    expect(screen.getByText('500 pts')).toBeInTheDocument();
  });

  it('calls onDone when Done button clicked', () => {
    const onDone = vi.fn();
    render(<ABSINReceipt {...defaultProps} onDone={onDone} />);
    fireEvent.click(screen.getByText('Done'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onPrint when print button clicked', () => {
    const onPrint = vi.fn();
    render(<ABSINReceipt {...defaultProps} onPrint={onPrint} />);
    fireEvent.click(screen.getByText('Print Receipt'));
    expect(onPrint).toHaveBeenCalledTimes(1);
  });
});
