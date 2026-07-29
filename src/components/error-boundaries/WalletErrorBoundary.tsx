import ErrorBoundary from '../ErrorBoundary';
export default function WalletErrorBoundary({ children }) {
  return <ErrorBoundary name="Wallet">{children}</ErrorBoundary>;
}
