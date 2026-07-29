import ErrorBoundary from '../ErrorBoundary';
export default function BookingErrorBoundary({ children }) {
  return <ErrorBoundary name="Booking & Payment">{children}</ErrorBoundary>;
}
