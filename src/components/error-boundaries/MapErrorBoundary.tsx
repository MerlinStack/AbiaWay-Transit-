import ErrorBoundary from '../ErrorBoundary';
export default function MapErrorBoundary({ children }) {
  return <ErrorBoundary name="Live Map">{children}</ErrorBoundary>;
}
