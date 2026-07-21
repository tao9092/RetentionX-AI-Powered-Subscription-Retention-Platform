# RetentionX Preliminary v1.0 Design System

The interface uses a premium editorial SaaS direction: a white canvas, black and dark-grey controls, soft-grey panels, and restrained warm peach/brown accents. Display headings use an editorial serif; body and operational content use a readable sans serif.

Design tokens live in `src/styles/tokens.css`; global layout, focus, readability and shared component foundations live in `src/styles/base.css`. Component-scoped CSS is reserved for view-specific layout.

## Accessibility and behaviour

- Body copy is at least 15px, operational cards/tables at least 14px, and metadata at least 12px.
- Page headings scale from approximately 36px to 56px.
- Keyboard focus uses a high-contrast brown outline.
- Status always includes a text label, never colour alone.
- The desktop sidebar collapses and scrolls independently; mobile uses a drawer.
- More tools and the command palette remain keyboard accessible.
- Rounded pills, generous spacing and quiet borders establish hierarchy without decorative clutter.
