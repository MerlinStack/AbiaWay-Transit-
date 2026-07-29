import React, { memo, useMemo } from 'react';

const BookingSummary = memo(({ details, onConfirm }) => {
  const totals = useMemo(() => {
    const baseFare = details.route?.fare || 350;
    const subtotal = baseFare * details.passengers;
    const discount = details.passengers >= 4 ? subtotal * 0.2 : 0;
    const fee = 50;
    return { subtotal, discount, fee, total: subtotal - discount + fee };
  }, [details.route?.fare, details.passengers]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Booking Summary</h3>

      {/* Trip Details */}
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <span className="text-gray-400">Route</span>
          <span className="font-semibold">{details.from} → {details.to}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Date & Time</span>
          <span>{details.date} at {details.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Passengers</span>
          <span>{details.passengers} {details.passengers === 1 ? 'person' : 'people'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Selected Seats</span>
          <span className="font-semibold">{details.seats.join(', ') || 'Not selected'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Vehicle Type</span>
          <span className="capitalize">{details.vehicleType} Bus</span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Base Fare</span>
          <span>₦{totals.subtotal.toLocaleString()}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between items-center text-green-400">
            <span className="flex items-center gap-1">
              <i data-lucide="tag" className="w-4 h-4"></i>
              Group Discount
            </span>
            <span>-₦{totals.discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Service Fee</span>
          <span>₦{totals.fee}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10 text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">₦{totals.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <i data-lucide="info" className="w-4 h-4 mt-0.5 flex-shrink-0"></i>
        <p>
          By confirming this booking, you agree to our terms of service and cancellation policy. 
          Tickets are non-refundable within 2 hours of departure.
        </p>
      </div>

      {/* Confirm Button */}
      <button
        className="w-full btn-primary py-4 text-lg"
        onClick={onConfirm}
      >
        <i data-lucide="check-circle" className="w-5 h-5 inline mr-2"></i>
        Confirm Booking
      </button>
    </div>
  );
});

export default BookingSummary;