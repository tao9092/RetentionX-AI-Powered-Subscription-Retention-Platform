# RetentionX

**AI-Powered Subscription Retention Platform**

RetentionX helps subscription businesses identify customers at risk of churn, understand the signals behind that risk, prioritise retention work, and estimate the recurring revenue that can be protected.

## Preliminary build

This repository contains the hackathon preliminary-round product prototype. It uses a curated customer portfolio and a transparent decision engine so the full product flow can be demonstrated without external services.

### Core workflow

1. Detect high-risk and under-utilised accounts.
2. Calculate customer health and churn probability.
3. Explain the strongest churn signals.
4. Recommend the next best retention action.
5. Compare intervention scenarios and expected revenue impact.
6. Track actions from planning to completion.

## Main features

- Executive retention overview
- Customer portfolio search and filters
- Independent Customer 360 page
- Explainable churn-risk signals
- Customer health scoring
- Revenue-at-risk calculations
- Next-best-action recommendations
- Retention action queue
- Scenario comparison lab
- Strategic portfolio insights
- CSV import and validation studio
- Collapsible desktop sidebar
- Responsive layout for desktop, laptop and mobile
- Local browser persistence for imported data and action status

## UI direction

Version 9 uses a light premium SaaS interface with:

- Large, readable typography
- Balanced information density
- Purple-blue primary actions with teal accents
- A collapsible desktop sidebar
- A vertically scrollable sidebar navigation area
- Secondary tools placed under **More tools**
- A dedicated Customer 360 page instead of a crowded drawer
- Reduced decorative status cards so navigation stays focused

See [DESIGN.md](./DESIGN.md) for the full visual system.

## Technology

- Vue 3
- TypeScript
- Vite
- CSS design system
- Browser `localStorage`

The preliminary prototype does not require a backend or external AI API.

## Run locally

Use Node.js 22.16 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

The generated production files are placed in `dist/`.

## Dataset

The included dataset is synthetic and intended for concept validation. It models customer usage, seat utilisation, support tickets, payment behaviour, satisfaction, renewal timing and recurring revenue.

For production use, the scoring model should be trained and validated against real historical churn and intervention outcomes.
