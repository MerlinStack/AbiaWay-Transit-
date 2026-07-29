import ErrorBoundary from '../ErrorBoundary';
export default function DriverErrorBoundary({ children }) {
  return <ErrorBoundary name="Driver Dashboard">{children}</ErrorBoundary>;
}
