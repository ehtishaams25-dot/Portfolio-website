# Design System

Edit global style decisions in `src/styles/design-system.css`.

- Brand colors live in `:root` and Tailwind `@theme`.
- Fonts live in the same file, so typography changes do not require touching components.
- Reusable classes use the `ds-` prefix: `ds-shell`, `ds-section`, `ds-title`, `ds-copy`, `ds-pill`, and `ds-icon-button`.
- Site content lives in `src/data/portfolio.ts`.

Components should prefer Tailwind utilities for layout and the `ds-` classes for repeated brand styling.
