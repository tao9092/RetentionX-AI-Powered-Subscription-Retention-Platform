# RetentionX

**Preliminary UI v5 — Comfort-First Decision Workspace**

**AI-Powered Subscription Retention Platform**

RetentionX helps subscription businesses identify customers at risk of churn, explain the signals behind that risk, prioritise the right intervention and estimate the subscription revenue that could be protected.


## UI and experience

The v5 interface is designed as an action-oriented customer-success workspace rather than a generic analytics dashboard. It includes:

- grouped navigation for monitoring, acting, and data management;
- a global `Ctrl K` command palette for customer search and page navigation;
- a concise portfolio briefing with a single “Today’s focus” account;
- semantic risk colours and consistent action hierarchy;
- keyboard-accessible customer rows and visible focus states;
- responsive customer cards on mobile;
- toast feedback for workflow and dataset changes; and
- an AI-readable `DESIGN.md` covering tokens, components, motion, and responsive behaviour.

The visual system is original and uses a charcoal shell, off-white canvas, violet analysis accents, and lime primary actions.

## Preliminary-round objective

The prototype demonstrates a complete decision workflow:

1. Import and validate a customer portfolio from CSV, or use the curated demo dataset.
2. Detect high-risk and under-utilised subscription accounts.
3. Calculate an explainable customer health score and churn probability.
4. Show the strongest risk signals for each account.
5. Segment the portfolio by churn risk and customer value.
6. Recommend a next-best retention action and response timeframe.
7. Track action progress from **Not started** to **Completed**.
8. Compare intervention scenarios by projected risk, cost, revenue protected and net benefit.
9. Export customer data or print a management-level insight report.

## Main screens

### Executive Overview

Portfolio KPIs, churn distribution, revenue risk by plan, high-priority accounts and action progress.

### Customers

Searchable and filterable customer portfolio with sorting by risk priority, revenue at risk or renewal date. The current view can be exported to CSV.

### Customer 360

Health score, churn probability, risk evidence, subscription utilisation, next-best action and action status.

### Strategic Insights

Risk-value segmentation, industry hotspots, common risk drivers, high-risk action coverage and renewal exposure windows. The page includes a print-friendly executive report mode.

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

### Customer Data Studio

CSV ingestion with:

- downloadable template;
- required-column validation;
- numeric and range checks;
- invalid-row reporting;
- scored-record preview;
- browser-only dataset persistence;
- active-portfolio export; and
- one-click restoration of the hackathon demo dataset.

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

## CSV schema

Required columns:

```text
companyName, industry, plan, monthlyRevenue, licensedSeats,
activeSeats, logins30d, previousLogins30d, featureUsagePct,
unresolvedTickets, latePayments90d, satisfactionScore,
daysUntilRenewal
```

`id` is optional. Valid plans are `Basic`, `Pro`, and `Enterprise`.

## Technology

- Vue 3
- TypeScript
- Vite
- CSS/SVG visualisations with no chart-library dependency
- Simulated B2B SaaS subscription dataset
- Browser `localStorage` for prototype data and action tracking
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
2. Open **Strategic Insights** and show the risk-value matrix and renewal exposure.
3. Select a high-value, high-risk account such as **CloudNine Commerce**.
4. Show the churn probability and explainable risk signals.
5. Open **Scenario Lab**, compare interventions and add the best-value option to the queue.
6. Return to **Retention Actions** and update its execution status.
7. End at **Data Studio** to show that the same workflow accepts a validated customer CSV rather than only fixed demo records.

## Repository update

To replace an earlier version while keeping Git history:

1. Keep the existing `.git` folder.
2. Copy this package into the repository root and replace matching files.
3. Run `npm install` and `npm run build`.
4. Commit and push the changes.

## Data disclaimer

The included dataset and intervention estimates are simulated for concept validation. Imported CSV files remain in the browser and are not sent to an external service. A production implementation should integrate CRM, product-usage, support, payment and feedback systems, then validate churn and intervention models with historical outcomes.
