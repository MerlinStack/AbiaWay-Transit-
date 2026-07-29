## Objective
Complete Phases 5–10 production upgrade and align the app with the Abia State Green Shuttle Service blueprint (ABSSIN identity, flat fares, 70 bus stops, battery telemetry, 40–120 bus fleet, driver/conductor workflows).

## Important Details
- Ground rule: no big-bang rewrites, remove old code when replacing, one concern per phase.
- Styling: ~95% Tailwind; MUI used only in Sidebar/Header; no new `sx` or `styled()`.
- All `.jsx` → `.tsx` migrated in Phase 4.
- Packages: React 19.2.4, Vite 8.0.3, react-leaflet, Zod, react-hook-form, react-window, zustand, vite-plugin-pwa, react-helmet-async.
- Vite 8 + rolldown: use ESM subpath imports for MUI icons.

## Work State
### Completed
- **Phase 5–10**: Maps, Forms, Performance, Components, Testing (41 tests), Accessibility & PWA — all done.
- **Blueprint data layer**: `src/types/abssin.ts` (ABSSINProfile, TransitWallet, FleetBus, etc.), `src/data/fares.ts` (flat-rate ₦150 local / ₦800–₦1,000 inter-city), `src/data/stops.ts` (2 solar terminals + 70 bus stops with GeoJSON + solar charger flags), `src/data/fleet.ts` (40 buses with battery SoC, range, loop scheduling, CCTV/exits status, scaling to 120).
- **Blueprint UI components**: `ABSSINRegister.tsx` (12-digit ABSSIN verification + profile registration + auto-login), `BusMarkersLayer.tsx` (battery colour-coded markers, route polylines, stop/solar-terminal layers), `LiveMap.tsx` (real fleet stats + SolarStationLayer), `DriverCheckin.tsx` (pilot/co-pilot login + 8-point vehicle checklist), `ConductorTab.tsx` (offline-first ABSSIN tap validation with IndexedDB sync), `FleetSchedule.tsx` (cards/list views, status filters, battery bars, active loop displays).
- **Flat fare integration**: `BookingFlow.tsx` now uses `getFare()` from blueprint data instead of hardcoded prices.
- **Git**: All changes committed and pushed (`21e5da2` + latest, ~130 files). Remote: `MerlinStack/AbiaWay-Transit-`.

### Active
- (none — all planned components implemented)

### Blocked
- (none)

## Next Move
1. Populate the app routing/navigation to wire new components (DriverCheckin, ConductorTab, FleetSchedule, ABSSINRegister) into the existing tabs or as new routes.
2. Consider adding a fleet analytics dashboard (range vs. SoC trends, solar charging ROI).
3. If deploying to production: verify PWA manifest, service worker caching, and NFC API fallback.
