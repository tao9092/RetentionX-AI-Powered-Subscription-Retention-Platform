# RetentionX Preliminary v1.0 Changes

## P0

- Consolidated the editorial design into central tokens and base styles.
- Replaced the legacy single status map with persistent historical retention actions.
- Added editable ownership, due dates, response, outcome, risk change, realised revenue, notes and reopening.
- Added Active Queue and Outcomes sections with clearly labelled synthetic demonstration outcomes.
- Separated Annual Revenue at Risk, Potential Protectable ARR and Realised Saved ARR.
- Refactored risk scoring to calculate from exact, source-labelled contributions.
- Added Model Transparency and visible scenario validation disclosures.
- Migrated storage to scoped `retentionx-v1-*` keys and removed only known obsolete v8 keys.
- Added critical business-logic tests with Vitest.

## P1

- Replaced the combined-file assumption with five independent CSV source imports and downloadable templates.
- Added source-level validation, duplicates, unmatched records, required/optional source reporting and completeness.
- Added source-aware risk lineage without invented healthy values for missing datasets.
- Added imported and synthetic-labelled Customer 360 activity timelines with category filters.
- Added directional plan-fit recommendations for onboarding, maintain, right-size and upsell.
- Expanded outcome analytics using recorded actions only, including funnel, responses, risk change and owner workload.

## P2

- Added a reproducible logistic-regression training pipeline with held-out metrics and frontend artifacts.
- Added validated browser inference with explicit heuristic fallback and engine audit events.
- Added an optional Supabase adapter, schema migration and basic role-based RLS.
- Added retention experiments with control/treatment tracking and no automatic causal-uplift claim.
- Added an outreach composer that saves drafts and records simulated sends without delivering email.
- Added local audit logging for dataset, model, action, response, outcome, revenue, experiment and campaign events.
- Expanded tests and added GitHub Actions quality verification.
