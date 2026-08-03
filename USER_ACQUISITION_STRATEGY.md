# AbiaWay User Acquisition Strategy

## Product Summary
**AbiaWay** = Abia State's official green fleet transit app. Cashless boarding via Abia Connect Card (ABSSIN), real-time bus tracking, offline-first validation, solar-powered eco-buses.

**Core Value Props:**
- Tap-to-board with rolling 30-sec encrypted QR (no cash, no fraud)
- Live bus locations + battery status on map
- Works offline in remote corridors (LeakyBucket sync)
- 10K+ users, 50+ buses, 4.8★ rating (landing page claims)

---

## Target User Segments (Prioritized)

| Segment | Pain Point | AbiaWay Hook | Size (Est.) |
|---------|------------|--------------|-------------|
| **Daily Commuters (Aba↔Umuahia)** | Cash delays, unknown bus arrival, no receipt | Live ETA, tap-to-board, instant receipt | 50K+ daily riders |
| **Students (ABSU, MOUAU, Polytechnics)** | Limited cash, safety concerns | Student fare discounts, tracked buses, parent visibility | 15K+ |
| **Market Traders (Ariaria, Ekeoha)** | Heavy cash handling, theft risk | Digital wallet, transaction history for bookkeeping | 20K+ |
| **Inter-LGA Commuters** | Fragmented info, unreliable schedules | Unified route planner, real-time tracking | 30K+ |
| **Diaspora/Visitors** | Don't know system, no local cash | Pre-load wallet, English UI, QR boarding | 5K+/month |

---

## Phase 1: Foundation (Weeks 1-4) — "Make It Real"

### 1.1 Product Readiness Gates
- [ ] **Real data**: Replace mock data with live GTFS feeds from Abia State Ministry of Transport
- [ ] **Real ABSSIN integration**: Connect to state identity ledger (not mock verification)
- [ ] **Payment rails**: Integrate Paystack/Flutterwave for wallet funding + POS agents for cash-in
- [ ] **Conductor app**: Separate PWA for offline QR validation (driver/conductor side)
- [ ] **Push notifications**: Trip reminders, bus arrival alerts, wallet low-balance

### 1.2 Measurement Infrastructure
```typescript
// Add to src/utils/analytics.ts
export const track = (event: string, props: Record<string, any>) => {
  // Plausible / GA4 / PostHog
  window.plausible?.(event, { props });
  // Also log to Firestore for cohort analysis
};
```

**Key Metrics to Track:**
| Metric | Target | Tool |
|--------|--------|------|
| WAU/MAU ratio | >40% | Mixpanel/PostHog |
| Wallet funding rate | >25% of signups | Custom events |
| First ride completion | >60% of funded users | Funnel |
| Retention D1/D7/D30 | 40%/20%/10% | Cohort |
| Referral K-factor | >0.3 | Viral loop tracking |

---

## Phase 2: Channel Strategy (Weeks 5-12)

### 2.1 Primary Channels (Ranked by CAC:LTV Potential)

| Channel | Why It Works Here | First Test | Budget % |
|---------|-------------------|------------|----------|
| **Field Agents at Terminals** | High intent, trust-building, cash-in support | 3 agents @ Aba Park, Umuahia Park, ABSU gate | 40% |
| **WhatsApp Community Groups** | Organic, peer-trusted, viral | "Abia Commuters Hub" + LGA-specific groups | 20% |
| **Campus Ambassadors** | Student network effects, low CAC | 5 ambassadors per major campus | 15% |
| **Market Trader Associations** | Group adoption, B2B2C | Pitch to Ariaria/Ekeoha union leadership | 15% |
| **Radio (Radio Nigeria Abia, BCA)** | Mass reach, local trust | 30-sec spots during drive time | 10% |

### 2.2 Field Agent Playbook (Terminal Activation)
```
Daily Routine (7am-7pm):
1. Station at boarding point with branded vest + QR standee
2. Demo: "Tap this card, board in 3 seconds"
3. Help download PWA (Add to Home Screen) — no app store friction
4. Assist first wallet funding (cash → agent → digital)
5. Capture: Name, Phone, ABSSIN, First destination
6. Give: ₦200 ride credit (referral code tracked)
```

**KPIs per Agent/Day:**
- 50+ meaningful interactions
- 15+ app installs
- 8+ first wallet fundings
- 5+ completed rides

### 2.3 WhatsApp Viral Loop
```
User shares referral link → Friend clicks → Opens PWA → 
Enters ABSSIN → Gets ₦200 credit → Funds ₦500+ → 
Both get ₦500 bonus after friend's first ride
```

**Technical Requirements:**
- Deep links: `abiaway://referral/CODE` → PWA handles
- Server-side referral attribution (Firestore)
- Auto-credit on first ride completion (webhook from payment)

---

## Phase 3: Retention & Expansion (Weeks 13-26)

### 3.1 Retention Mechanics
| Mechanism | Trigger | Reward |
|-----------|---------|--------|
| **Streak Bonus** | 5 consecutive weekdays riding | ₦500 wallet credit |
| **Off-Peak Discount** | Ride 10am-3pm | 20% fare discount (auto-applied) |
| **Referral Milestone** | 3 friends complete first ride | "Abia Way Champion" badge + ₦2000 |
| **Wallet Auto-Topup** | Balance < ₦500 | Prompt + 5% bonus on ₦2000+ topup |

### 3.2 Expansion Routes (Data-Driven)
1. **Analyze**: Heatmap of drop-off points + search queries with no results
2. **Pilot**: Add 1 new LGA route per month (start: Aba↔Ohafia, Umuahia↔Bende)
3. **Partner**: Onboard 2 private fleet operators per LGA (revenue share)

---

## Budget Allocation (6 Months)

| Category | Month 1-2 | Month 3-4 | Month 5-6 | Total |
|----------|-----------|-----------|-----------|-------|
| Field Agents (salary+commission) | ₦2.4M | ₦3.6M | ₦4.8M | ₦10.8M |
| WhatsApp/Community Mgmt | ₦600K | ₦800K | ₦1M | ₦2.4M |
| Campus Ambassadors (stipends) | ₦450K | ₦600K | ₦750K | ₦1.8M |
| Radio Spots | ₦1.2M | ₦1.2M | ₦1.2M | ₦3.6M |
| Referral Credits (wallet) | ₦800K | ₦1.5M | ₦2M | ₦4.3M |
| Print (standees, flyers, vests) | ₦500K | ₦300K | ₦200K | ₦1M |
| **Total** | **₦5.95M** | **₦8M** | **₦9.95M** | **₦23.9M** |

**Projected CAC:** ₦1,200-1,800/user (blended)
**Projected LTV:** ₦8,000-12,000 (18-month horizon, 4 rides/week × ₦300 × 72 weeks)

---

## Quick Wins (Do This Week)

1. **Add PWA install prompt** — `src/main.tsx` + `vite.config.js` (PWA plugin already there)
2. **Instrument referral deep links** — 2 hours dev work
3. **Print 50 QR standees** — ₦75K, deploy at 3 terminals Monday
4. **Create WhatsApp group** — "Abia Way Commuters" — invite 50 power users
5. **Record 60-sec demo video** — screen record app flow, share in groups

---

## Success Definition (6 Months)

| Metric | Target |
|--------|--------|
| **Active Riders (WAU)** | 15,000 |
| **Wallet-Funded Users** | 5,000 |
| **Daily Rides via App** | 8,000 |
| **Agent Network** | 12 terminals covered |
| **Referral % of New Users** | 35% |
| **Revenue (wallet float + fare share)** | ₦4M/month |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low ABSSIN registration rate | High | High | Partner with Ministry for registration drives at terminals |
| Conductor resistance to QR scanning | Medium | High | Incentivize: ₦50/scan logged, offline-first = no embarrassment |
| Network issues in remote LGAs | High | Medium | LeakyBucket already built; emphasize offline demo |
| Competitor (cash, okada) | High | High | Price parity + speed advantage (tap vs. change-hunting) |
| Regulatory pushback | Low | High | Ministry partnership from Day 1; data sovereignty compliance |

---

## Next Steps (Owner: You)

1. **Validate assumptions**: Talk to 10 commuters at Aba Park this week — what stops them from going cashless?
2. **Lock Ministry partnership**: Formal MOU for ABSSIN integration + terminal access
3. **Hire 1 field agent** (start with 1, learn, scale)
4. **Ship PWA install + referral links** (dev: 1 sprint)
5. **Set up dashboard**: Real-time WAU, funding funnel, ride completion

---

*Strategy doc version 1.0 — iterate weekly based on field data.*