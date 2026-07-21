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
