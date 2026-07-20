# RetentionX UI Design System

## Product character

RetentionX should feel like a serious decision workspace rather than a generic analytics template. The interface combines a restrained charcoal navigation shell, an off-white operational canvas, and high-contrast signal colours. Visual hierarchy must help a customer-success manager answer three questions quickly:

1. Which accounts need attention?
2. Why are they at risk?
3. What action should be taken next?

## Design principles

### Signal before decoration

Every accent colour communicates meaning. Red is reserved for churn exposure, amber for attention, green for healthy or protected value, violet for product navigation and analysis, and lime for decisive primary actions.

### Progressive disclosure

Portfolio-level information appears first. Evidence and action detail are revealed through Customer 360, Scenario Lab, and the command palette instead of crowding the overview.

### Fast scanning

Use short labels, aligned numbers, consistent card headers, muted helper text, and compact status chips. Important monetary and risk values use stronger weight and tighter letter spacing.

### Action-oriented UX

Primary actions use lime on charcoal or lime on white. Secondary actions use neutral outlines. Every risk view should offer a clear path to evidence, scenario comparison, or the action queue.

### Accessible interaction

All interactive elements require visible focus states, adequate contrast, clear hover states, and touch targets close to 40px. Tables convert into stacked cards on small screens.

## Colour tokens

```css
--rx-bg: #f4f5f7;
--rx-surface: #ffffff;
--rx-sidebar: #111316;
--rx-ink: #17191d;
--rx-muted: #7c838e;
--rx-border: #e4e6e9;
--rx-primary: #6656e8;
--rx-primary-soft: #f0edff;
--rx-lime: #d8ff72;
--rx-danger: #df4b64;
--rx-warning: #d98a16;
--rx-success: #1e9d72;
--rx-blue: #277fe8;
```

## Typography

Use the system Inter-compatible stack to avoid external font dependencies.

- Page title: 25–34px, weight 700–800, tight tracking.
- Panel title: 13–15px, weight 700.
- KPI value: 24–38px, weight 750–850.
- Body: 9–11px in the compact dashboard context.
- Eyebrow labels: 7–8px, uppercase, strong tracking.

## Spacing and shape

Use an 8px base rhythm.

- Page padding: 26px desktop, 14px mobile.
- Panel gap: 14–18px.
- Card radius: 17–22px.
- Control radius: 9–11px.
- Borders: 1px neutral grey.
- Shadows: subtle; use elevation only to separate interactive surfaces.

## Core components

### Sidebar

- Width: 252px desktop.
- Group navigation into Monitor, Act, and Manage.
- Use a lime inset indicator for the active route.
- Include workspace search with `Ctrl K`.
- Keep status and version details secondary.

### Top bar

- Sticky and translucent.
- Contains page context, global search, data-source status, priority-action shortcut, and profile state.
- Hide nonessential controls at smaller widths.

### KPI card

- Label at top left, semantic icon at top right.
- Main value is the visual anchor.
- Helper text and a small contextual tag sit at the bottom.

### Risk badge

- Dot + probability + band.
- High, medium, and low colours must be consistent everywhere.

### Customer table

- Dense but readable desktop rows.
- Keyboard-accessible rows.
- Mobile layout becomes stacked account cards rather than horizontal scrolling.

### Customer 360 drawer

- Sticky identity header.
- Health and risk summary first.
- Evidence list second.
- Dark next-best-action card last, with status and scenario actions.

### Command palette

- `Ctrl K` opens global navigation and customer search.
- Show priority customers before page shortcuts.
- Close on Escape or outside click.

## Motion

Keep motion short and functional.

- Drawer: 200ms slide.
- Command palette: 160ms scale and fade.
- Hover: 150–180ms.
- Toast: 200ms rise and fade.

Avoid decorative looping animation.

## Responsive behaviour

- Below 1180px: KPI cards become two columns.
- Below 1000px: analytics sections stack.
- Below 900px: sidebar becomes an overlay drawer.
- Below 700px: page padding reduces and control groups stack.
- Below 640px: customer tables become cards.
