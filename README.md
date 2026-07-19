# RetentionX

**AI-Powered Subscription Retention Platform**

RetentionX helps subscription businesses identify customers at risk of churn, understand the reasons behind the risk, prioritise the right intervention and estimate the subscription revenue that could be protected.

## Preliminary-round objective

The prototype demonstrates one complete decision workflow:

1. Detect high-risk and under-utilised subscription accounts.
2. Calculate an explainable customer health score and churn probability.
3. Show the strongest risk signals for each account.
4. Recommend a next-best retention action and response timeframe.
5. Prioritise accounts using risk, revenue and recoverability.
6. Estimate monthly revenue at risk and potential annual revenue protected.

## Main screens

- **Executive Overview** — portfolio KPIs, churn distribution, revenue risk by plan and high-priority accounts.
- **Customers** — searchable and filterable customer portfolio.
- **Customer 360 Drawer** — health score, risk evidence and next-best action.
- **Retention Actions** — prioritised action queue with timeframe and revenue impact.

## Prototype model

The preliminary demo uses a transparent rule-based scoring model based on:

- 30-day usage decline
- feature adoption
- licensed-seat utilisation
- unresolved support tickets
- customer satisfaction
- late payment behaviour
- days until renewal

This is intentional for the preliminary round: every result is explainable and the end-to-end product workflow is usable. A validated machine-learning model can later replace the scoring layer while preserving the same interface and decision workflow.

## Technology

- Vue 3
- TypeScript
- Vite
- CSS/SVG visualisations with no chart-library dependency
- Simulated B2B SaaS subscription dataset

## Run locally

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

1. Open **Executive Overview** and explain the revenue at risk.
2. Select a high-risk account such as **CloudNine Commerce**.
3. Show the churn probability and explainable risk signals.
4. Present the recommended action, timeframe and potential revenue protected.
5. Open **Retention Actions** to show how the system prioritises the entire portfolio.

## Data disclaimer

The included dataset and intervention estimates are simulated for concept validation. A production implementation should integrate CRM, product-usage, support, payment and feedback systems, then validate churn and intervention models using historical outcomes.
