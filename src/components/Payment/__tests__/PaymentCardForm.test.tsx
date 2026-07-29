import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentCardForm from '../PaymentCardForm';

const defaultProps = {
  amount: '5000',
  onAmountChange: vi.fn(),
  cardDetails: { number: '', expiry: '', cvv: '', holder: '' },
  onCardDetailChange: vi.fn(),
  cardBalance: null,
  checkingBalance: false,
  isProcessing: false,
  onCheckBalance: vi.fn(),
  onPay: vi.fn(),
  onBack: vi.fn(),
};

describe('PaymentCardForm', () => {
  it('renders the form title', () => {
    render(<PaymentCardForm {...defaultProps} />);
    expect(screen.getByText('Card Payment')).toBeInTheDocument();
  });

  it('renders amount input', () => {
    render(<PaymentCardForm {...defaultProps} />);
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('renders card number input', () => {
    render(<PaymentCardForm {...defaultProps} />);
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
  });

  it('shows balance info when cardBalance is provided', () => {
    render(
      <PaymentCardForm
        {...defaultProps}
        cardBalance={{ balance: 25000, cardType: 'visa', lastFour: '3456' }}
      />
    );
    expect(screen.getByText('₦25,000')).toBeInTheDocument();
    expect(screen.getByText(/VISA/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<PaymentCardForm {...defaultProps} onBack={onBack} />);
    const buttons = screen.getAllByRole('button');
    const backButton = buttons[0];
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onPay when pay button is clicked', () => {
    const onPay = vi.fn();
    render(<PaymentCardForm {...defaultProps} amount="5000" onPay={onPay} />);
    fireEvent.click(screen.getByText('Pay ₦5000'));
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('disables pay button when isProcessing is true', () => {
    render(<PaymentCardForm {...defaultProps} isProcessing={true} />);
    expect(screen.getByText('Processing...')).toBeDisabled();
  });

  it('disables check balance button when checkingBalance is true', () => {
    render(<PaymentCardForm {...defaultProps} checkingBalance={true} />);
    const buttons = screen.getAllByRole('button');
    const checkBalanceButton = buttons[1];
    expect(checkBalanceButton).toBeDisabled();
  });
});
