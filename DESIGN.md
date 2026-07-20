# RetentionX v8 Design System

## Visual direction

RetentionX v8 uses a **purple-blue + teal** enterprise SaaS palette. Purple communicates intelligence and orchestration; teal communicates healthy customer relationships, recovery and completed actions.

## Core colours

| Token | Colour | Usage |
|---|---|---|
| Primary | `#625CF6` | Active navigation, primary buttons, key emphasis |
| Primary dark | `#4B46C9` | Hover and pressed states |
| Primary soft | `#ECEBFF` | Selected cards, icon backgrounds |
| Teal | `#16B8A6` | Success, recovery, healthy signals |
| Teal accent | `#39D0C2` | CTA badges, action counts, highlights |
| Blue | `#2D7FF9` | Informational metrics and links |
| Ink | `#1F2753` | Main headings and body hierarchy |
| Background | `#F6F7FC` | Application canvas |
| Surface | `#FFFFFF` | Cards, tables and panels |
| Border | `#DFE3F1` | Dividers and card outlines |

## Gradient

Primary hero surfaces use `#302E81 → #625CF6 → #16B8A6`, keeping purple dominant and teal as the recovery accent.

## Accessibility

- Body typography remains 18px at the application level.
- Primary actions use white on purple or deep ink on teal.
- Status colours are paired with text labels, not colour alone.
- Focus rings use a visible purple outline.


## v9 navigation behaviour

- The brand header remains fixed at the top of the sidebar.
- Search and navigation live inside a dedicated vertical scroll container.
- The scroll container uses a slim purple-tinted scrollbar.
- Expanding **More tools** scrolls the new options into the nearest visible position.
- Decorative workspace and dataset-status cards were removed to reduce noise.
