# Code Style

## TypeScript
- ES modules (`import`/`export`), never CommonJS (`require`)
- Destructure imports: `import { useState, useEffect } from "react"`
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Strict mode enabled — no `any` types without explicit justification in a comment
- Interfaces over types for object shapes. Types for unions and intersections.
- Enums only for fixed sets (artefact types, objective IDs, format types). Use string literal unions otherwise.

## React
- Functional components only, no class components
- Named exports for components: `export function ObjectiveCard() {}`
- Default exports only for page-level components (route targets)
- Hooks at the top of the component, before any early returns
- Custom hooks in `hooks/` directory, prefixed with `use`
- Context providers in `context/` directory
- Destructure props in the function signature: `function Card({ title, children }: CardProps)`

## Inline Styles
- All styles are inline `style={{}}` objects — no CSS files, no Tailwind, no styled-components
- Extract style objects to `const` when reused: `const cardStyle: React.CSSProperties = { ... }`
- Use the design tokens from `docs/DESIGN_SYSTEM.md` — never hard-code colour values without referencing the token name in a comment
- Hover/focus states via `onMouseEnter`/`onMouseLeave` with state, or CSS-in-JS keyframes for animations

## File Naming
- Components: PascalCase (`ObjectiveCard.tsx`)
- Hooks: camelCase with `use` prefix (`useObjectiveData.ts`)
- Constants: camelCase (`salesCoachSystemPrompt.ts`)
- Pages: PascalCase (`DashboardPage.tsx`)
- Types: PascalCase in a `types/` directory (`Objective.ts`, `Artefact.ts`)

## Imports Order
1. React and React libraries
2. Third-party libraries
3. Context/hooks
4. Components
5. Constants/types
6. Assets

Blank line between each group.
