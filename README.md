# RetentionX

**AI-Powered Subscription Retention Platform**

RetentionX helps subscription businesses identify customers at risk of churn, explain the signals behind that risk, prioritise the right intervention and estimate the subscription revenue that could be protected.

## Preliminary-round objective

The prototype demonstrates a complete decision workflow:

1. Detect high-risk and under-utilised subscription accounts.
2. Calculate an explainable customer health score and churn probability.
3. Show the strongest risk signals for each account.
4. Recommend a next-best retention action and response timeframe.
5. Track action progress from **Not started** to **Completed**.
6. Compare intervention scenarios by projected risk, cost, revenue protected and net benefit.
7. Export the filtered customer-risk portfolio as CSV.

## Main screens

### Executive Overview

Portfolio KPIs, churn distribution, revenue risk by plan, high-priority accounts and action progress.

### Customers

Searchable and filterable customer portfolio with sorting by risk priority, revenue at risk or renewal date. The current view can be exported to CSV.

### Customer 360

Health score, churn probability, risk evidence, subscription utilisation, next-best action and action status.

### Retention Actions

A persistent work queue. Action statuses are stored in the browser for the hackathon demo.

### Scenario Lab

A what-if comparison of:

- no intervention;
- support recovery;
- guided onboarding;
- subscription plan right-sizing;
- targeted renewal incentive; and
- a combined recovery plan.

Each eligible scenario shows projected churn risk, intervention cost, annual revenue protected, net benefit and directional ROI.

## Prototype model

The preliminary demo uses a transparent rule-based scoring model based on:

- 30-day usage decline;
- feature adoption;
- licensed-seat utilisation;
- unresolved support tickets;
- customer satisfaction;
- late payment behaviour; and
- days until renewal.

The scenario model is intentionally labelled as a **directional estimate**, not a causal guarantee. In production, the churn and intervention layers should be validated using historical outcomes or controlled experiments.

## Technology

- Vue 3
- TypeScript
- Vite
- CSS/SVG visualisations with no chart-library dependency
- Simulated B2B SaaS subscription dataset
- Browser `localStorage` for prototype action tracking
- GitHub Actions build check

## Run locally

Requirements: Node.js 22.18+ or 24.12+.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Recommended demo flow

1. Open **Executive Overview** and explain monthly revenue at risk.
2. Select a high-risk account such as **CloudNine Commerce**.
3. Show the churn probability and explainable risk signals.
4. Set its action status to **Planned**.
5. Open **Scenario Lab** and compare the available interventions.
6. Choose the best-value scenario and add it to the action queue.
7. Return to **Retention Actions** to show the persistent workflow.

## Repository update

To replace an earlier version while keeping Git history:

1. Keep the existing `.git` folder.
2. Copy this package into the repository root and replace matching files.
3. Run `npm install` and `npm run build`.
4. Commit and push the changes.

## Data disclaimer

The included dataset and intervention estimates are simulated for concept validation. A production implementation should integrate CRM, product-usage, support, payment and feedback systems, then validate churn and intervention models with historical outcomes.
