import { memo } from 'react';
import BookingFlow from './BookingFlow';

const BookingTab = memo(() => (
  <BookingFlow>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BookingFlow.Main />
      <BookingFlow.Sidebar />
    </div>
  </BookingFlow>
));

export default BookingTab;
