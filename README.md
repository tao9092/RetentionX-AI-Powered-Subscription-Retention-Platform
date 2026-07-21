# RetentionX Preliminary v1.0

RetentionX is a browser-only Vue 3 and TypeScript prototype for subscription-retention decision support. It uses transparent heuristic risk scoring, specific next-best actions, scenario estimates, and an outcome-aware Action Center.

## P0 capabilities

- Editorial white, black, soft-grey, peach and brown interface with serif headings
- Responsive, collapsible and scrollable navigation, mobile drawer and command palette
- Customer portfolio and Customer 360 with exact risk evidence
- Action Center with owners, due dates, workflow status, customer response, outcome, risk change, realised saved ARR, notes and history
- Outcomes that keep `Completed` separate from `Retained`
- Annual Revenue at Risk, Potential Protectable ARR and Realised Saved ARR with distinct formulas
- Model Transparency page describing the preliminary heuristic and every customer contribution
- Browser persistence under scoped `retentionx-v1-*` keys
- Five independent browser-only CSV demo connectors for account, usage, billing, support and feedback data
- Source validation, customerId merging, completeness and unmatched/duplicate reporting
- Customer activity timelines with imported lineage and clearly labelled synthetic demo events
- Directional plan-fit recommendations covering onboarding, maintain, right-size and upsell
- Recorded-outcome analytics, retention funnel, owner workload and overdue actions

The curated portfolio and three labelled historical outcomes are synthetic hackathon demonstration data. The risk score is not a calibrated production ML probability. Scenario results are directional prototype estimates and are not causally validated.

## Setup

Requires Node.js 22.16 or newer.

```bash
npm ci
npm run dev
```

Validation:

```bash
npm run type-check
npm run test:run
npm run build
```

## Architecture

- `src/App.vue`: navigation and safe local persistence
- `src/styles/tokens.css`, `src/styles/base.css`: current design system
- `src/utils/riskCalculator.ts`: deterministic heuristic contributions
- `src/utils/actionManager.ts`: action lifecycle and outcome metrics
- `src/utils/revenueMetrics.ts`: revenue definitions
- `src/utils/recommendationEngine.ts`, `scenarioEngine.ts`, `csvParser.ts`: deterministic decision support
- `src/utils/multiSourceData.ts`: five-source parsing, validation, merging and event derivation
- `src/utils/timeline.ts`, `planFit.ts`: customer activity and directional plan fit

No backend, external integration, or AI API is required for demo mode.
