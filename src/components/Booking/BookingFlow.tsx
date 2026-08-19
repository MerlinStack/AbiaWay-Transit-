import { Check, MapPin, Gift, Clock, CreditCard, Smartphone } from 'lucide-react';
import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import useBookingStore from '../../stores/bookingStore';
import useWalletStore from '../../stores/walletStore';
import useNotificationStore from '../../stores/notificationStore';
import { getTransitService } from '../../services/transit';
import { BusStop } from '../../types/abssin';
import RouteSearch from './RouteSearch';
import SeatSelection from './SeatSelection';
import PaymentMethod from '../Payment/PaymentMethod';
import BookingSummary from './BookingSummary';
import SavedRoutes from './SavedRoutes';
import BookingHistory from './BookingHistory';
import ABSINPaymentDemo from '../Payment/ABSINPaymentDemo';

const TERMINAL_NAMES: Record<string, string> = {};
const STOP_NAMES: Record<string, string> = {};

const resolveName = (id: string) => TERMINAL_NAMES[id] || STOP_NAMES[id] || id;

const AVAILABLE_ROUTES = [
  { id: 1, name: 'Umuahia → Aba', via: 'Umuahia-Aba Expressway', duration: '25 mins', fare: 800, departures: ['08:00', '08:30', '09:00', '09:30'], available: 24, from: 'Umuahia-Terminal', to: 'Aba-Terminal', routeType: 'local' as const },
  { id: 2, name: 'Aba → Umuahia', via: 'Aba-Umuahia Road', duration: '25 mins', fare: 800, departures: ['08:15', '08:45', '09:15', '09:45'], available: 18, from: 'Aba-Terminal', to: 'Umuahia-Terminal', routeType: 'local' as const },
  { id: 3, name: 'Umuahia → Ohafia', via: 'Ohafia Road', duration: '30 mins', fare: 1000, departures: ['08:30', '09:00', '09:30', '10:00'], available: 32, from: 'Umuahia-Terminal', to: 'Ohafia-Terminal', routeType: 'inter-city' as const },
];

interface BookingDetails {
  from: string; to: string; date: string; time: string;
  passengers: number; route: any | null; seats: string[];
  vehicleType: string; paymentMethod: string;
}

interface BookingFlowContextValue {
  step: number;
  bookingDetails: BookingDetails;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  availableRoutes: typeof AVAILABLE_ROUTES;
  goToStep: (s: number) => void;
  handleSearch: (data: Partial<BookingDetails>) => void;
  handleRouteSelect: (route: any) => void;
  handleSeatSelect: (seats: string[]) => void;
  handlePayment: () => void;
  handleABSINSuccess: (result: any) => void;
  showABSINModal: boolean;
  setShowABSINModal: (v: boolean) => void;
  paymentAmount: number;
  rideDetails: any;
}

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export const useBookingFlow = () => {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error('useBookingFlow must be used within BookingFlow');
  return ctx;
};

const initialDetails: BookingDetails = {
  from: '', to: '', date: new Date().toISOString().split('T')[0],
  time: '08:00', passengers: 1, route: null, seats: [],
  vehicleType: 'standard', paymentMethod: 'wallet',
};

const BookingFlowRoot = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialDetails);
  const [showABSINModal, setShowABSINModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [rideDetails, setRideDetails] = useState({});
  const [loadingStops, setLoadingStops] = useState(true);

  useEffect(() => {
    const loadStops = async () => {
      const transit = getTransitService();
      const [terminals, stops] = await Promise.all([
        transit.getTerminals(),
        transit.getAllStops(),
      ]);
      terminals.forEach(t => { TERMINAL_NAMES[t.id] = t.name; });
      stops.forEach(s => { STOP_NAMES[s.id] = s.name; });
      setLoadingStops(false);
    };
    loadStops();
  }, []);

  const createBooking = useBookingStore((s) => s.createBooking);
  const addRecentSearch = useBookingStore((s) => s.addRecentSearch);
  const balance = useWalletStore((s) => s.balance);
  const deductFunds = useWalletStore((s) => s.deductFunds);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const goToStep = useCallback((s: number) => setStep(s), []);

  const handleSearch = useCallback((searchData: Partial<BookingDetails>) => {
    setBookingDetails((prev) => ({ ...prev, ...searchData }));
    addRecentSearch({ from: searchData.from || '', to: searchData.to || '' });
    setStep(2);
  }, [addRecentSearch]);

  const handleRouteSelect = useCallback((route: any) => {
    setBookingDetails((prev) => ({ ...prev, route }));
    setStep(3);
  }, []);

  const handleSeatSelect = useCallback((seats: string[]) => {
    setBookingDetails((prev) => ({ ...prev, seats }));
    setStep(4);
  }, []);

  const handlePayment = useCallback(() => {
    const amount = (bookingDetails.route?.fare || 350) * bookingDetails.passengers;
    if (bookingDetails.paymentMethod === 'absin') {
      setPaymentAmount(amount);
      setRideDetails({
        from: bookingDetails.from, to: bookingDetails.to,
        busId: bookingDetails.route?.id || 'AB-101', seats: bookingDetails.seats,
        passengers: bookingDetails.passengers, distance: '18.5 km',
        duration: bookingDetails.route?.duration || '25 mins',
      });
      setShowABSINModal(true);
    } else if (bookingDetails.paymentMethod === 'wallet') {
      if (balance < amount) { showNotification('Insufficient Balance', 'Please top up your wallet'); return; }
      deductFunds(amount, `Bus Booking: ${bookingDetails.from} → ${bookingDetails.to}`);
      createBooking({ ...bookingDetails, fare: amount, status: 'confirmed' });
      showNotification('Booking Confirmed!', `Your trip from ${bookingDetails.from} to ${bookingDetails.to} is confirmed`);
      setTimeout(() => { setStep(1); setBookingDetails(initialDetails); }, 3000);
    }
  }, [bookingDetails, balance, createBooking, deductFunds, showNotification]);

  const handleABSINSuccess = useCallback((result: any) => {
    createBooking({ ...bookingDetails, fare: paymentAmount, status: 'confirmed', transactionId: result.transactionId });
    showNotification('Booking Confirmed!', `Your trip from ${bookingDetails.from} to ${bookingDetails.to} is confirmed`);
    setTimeout(() => { setStep(1); setShowABSINModal(false); setBookingDetails(initialDetails); }, 3000);
  }, [bookingDetails, paymentAmount, createBooking, showNotification]);

  const value = useMemo(() => ({
    step, bookingDetails, setBookingDetails, availableRoutes: AVAILABLE_ROUTES,
    goToStep, handleSearch, handleRouteSelect, handleSeatSelect,
    handlePayment, handleABSINSuccess, showABSINModal, setShowABSINModal,
    paymentAmount, rideDetails,
  }), [step, bookingDetails, showABSINModal, paymentAmount, rideDetails,
      goToStep, handleSearch, handleRouteSelect, handleSeatSelect,
      handlePayment, handleABSINSuccess]);

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
      {showABSINModal && (
        <ABSINPaymentDemo
          onClose={() => setShowABSINModal(false)}
          rideDetails={rideDetails}
          amount={paymentAmount}
          onSuccess={handleABSINSuccess}
        />
      )}
    </BookingFlowContext.Provider>
  );
};

const StepIndicator = () => {
  const { step } = useBookingFlow();
  const labels = ['', 'Search', 'Select Route', 'Choose Seats', 'Payment'];
  return (
    <div className="flex justify-between mb-8" role="navigation" aria-label="Booking progress">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex-1 relative" aria-current={s === step ? 'step' : undefined}>
          <div className={`step-indicator flex items-center ${s < step ? 'completed' : s === step ? 'active' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              s < step ? 'bg-green-600 text-white' : s === step
                ? 'bg-primary text-white ring-4 ring-primary/30' : 'bg-white/10 text-gray-400'
            }`} aria-label={`Step ${s}: ${labels[s]}${s < step ? ' (completed)' : ''}`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            <div className={`flex-1 h-1 ml-2 ${s < step ? 'bg-green-600' : 'bg-white/10'}`} aria-hidden="true" />
          </div>
          <p className="text-xs mt-2 text-gray-400">{labels[s]}</p>
        </div>
      ))}
    </div>
  );
};

const Search = () => {
  const { handleSearch, bookingDetails } = useBookingFlow();
  return <RouteSearch onSearch={handleSearch} initialData={bookingDetails} />;
};

const RouteSelect = () => {
  const { bookingDetails, setBookingDetails, availableRoutes, handleRouteSelect } = useBookingFlow();
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        Available Routes from {bookingDetails.from} to {bookingDetails.to}
      </h3>
      <div className="space-y-3">
        {availableRoutes.map((route) => (
          <div key={route.id}
            className={`route-item p-4 cursor-pointer transition-all hover:scale-[1.02] ${
              bookingDetails.route?.id === route.id ? 'selected border-primary' : ''
            }`}
            onClick={() => handleRouteSelect(route)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="font-semibold text-lg">{route.name}</h4>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">{route.duration}</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">{route.available} seats left</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  <MapPin className="w-3 h-3 inline mr-1" />Via: {route.via}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {route.departures.map((time) => (
                    <button key={time}
                      className="text-xs px-3 py-1 bg-white/10 rounded-lg hover:bg-primary/20 transition"
                      onClick={(e) => { e.stopPropagation(); setBookingDetails((prev) => ({ ...prev, time })); }}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-primary">₦{route.fare}</p>
                <p className="text-xs text-gray-400">per seat</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Seats = () => {
  const { handleSeatSelect, bookingDetails } = useBookingFlow();
  return (
    <SeatSelection
      onSelect={handleSeatSelect}
      selectedSeats={bookingDetails.seats}
      passengers={bookingDetails.passengers}
    />
  );
};

const Payment = () => {
  const { bookingDetails, setBookingDetails, handlePayment, handleABSINSuccess } = useBookingFlow();
  return (
    <div className="space-y-6">
      <PaymentMethod
        selected={bookingDetails.paymentMethod}
        onSelect={(method) => setBookingDetails((prev) => ({ ...prev, paymentMethod: method }))}
        rideDetails={{
          from: bookingDetails.from, to: bookingDetails.to,
          busId: bookingDetails.route?.id || 'AB-101', seats: bookingDetails.seats,
          passengers: bookingDetails.passengers,
        }}
        amount={(bookingDetails.route?.fare || 350) * bookingDetails.passengers}
        onSuccess={handleABSINSuccess}
      />
      <BookingSummary details={bookingDetails} onConfirm={handlePayment} />
    </div>
  );
};

const Sidebar = () => {
  const { setBookingDetails, goToStep } = useBookingFlow();
  return (
    <div className="space-y-6">
      <SavedRoutes onSelect={(route) => { setBookingDetails((prev) => ({ ...prev, ...route })); goToStep(2); }} />
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="text-primary" />Special Offers
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
            <div className="flex justify-between items-start mb-2">
              <div><p className="font-semibold">First Ride</p><p className="text-xs text-gray-400">50% off your first booking</p></div>
              <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">NEW</span>
            </div>
            <p className="text-xs text-primary mt-2">Code: WELCOME50</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
            <div className="flex justify-between items-start mb-2">
              <div><p className="font-semibold">Weekend Special</p><p className="text-xs text-gray-400">25% off express rides</p></div>
              <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">WEEKEND</span>
            </div>
            <p className="text-xs text-primary mt-2">Valid Sat-Sun</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <div className="flex justify-between items-start mb-2">
              <div><p className="font-semibold">Group Discount</p><p className="text-xs text-gray-400">20% off for 4+ passengers</p></div>
              <span className="text-xs bg-yellow-500/30 px-2 py-1 rounded-full">GROUP</span>
            </div>
            <p className="text-xs text-primary mt-2">Auto-applied at checkout</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-3">Travel Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-primary mt-0.5" /><span>Arrive 15 mins before departure</span></li>
          <li className="flex items-start gap-2"><CreditCard className="w-4 h-4 text-primary mt-0.5" /><span>Use wallet for 5% cashback</span></li>
          <li className="flex items-start gap-2"><Smartphone className="w-4 h-4 text-primary mt-0.5" /><span>Digital tickets save paper</span></li>
        </ul>
      </div>
    </div>
  );
};

const Main = () => {
  const { step } = useBookingFlow();
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="glass-card p-6">
        <StepIndicator />
        <div className="min-h-[400px]">
          {step === 1 && <Search />}
          {step === 2 && <RouteSelect />}
          {step === 3 && <Seats />}
          {step === 4 && <Payment />}
        </div>
      </div>
      <BookingHistory />
    </div>
  );
};

const BookingFlow = Object.assign(BookingFlowRoot, { Main, Sidebar });

export default BookingFlow;
