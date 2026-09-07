# Taskly Design System Context

## Design source

- Figma file: https://www.figma.com/design/oL1WORO4G2iuQfSGPd4qvS/Taskly--Tasks-Management---Copy-
- Style Guide node ID: `76:1757`

Figma is the source of truth for UI. This document records direction only; it does not claim that exact token values or component specifications have been extracted yet.

## Known visual foundations

The Style Guide is known to include:

- Inter typography
- A primary/action blue system
- Surface and background tonal hierarchy
- Semantic success, error, and warning colors
- Reusable buttons
- Reusable form controls
- Reusable iconography

Exact families, weights, sizes, line heights, color values, spacing, radii, shadows, states, and breakpoints remain unverified until inspected through Figma MCP.

## Token strategy

When verified, translate Style Guide foundations into semantic, reusable project tokens rather than scattering raw values through components. Prefer role-based names that express intent, such as action, surface, text, border, and semantic feedback roles. Preserve relationships between typography, spacing, color, radius, elevation, and interaction states. Do not invent missing tokens.

## Typography

Use Inter according to verified Figma styles. Centralize font loading and typography roles after scaffold setup. Components should consume semantic typography styles rather than independently reproducing raw font values.

## SVG assets

Use the project's future SVGR workflow for Figma SVG assets so icons and illustrations remain reusable and type-safe. Preserve the supplied geometry and intended color behavior. Do not replace available assets with text glyphs, emoji, or approximations.

## Responsive and component reuse

Desktop and mobile designs are both required. Inspect both variants and implement their intended layout and interaction changes; do not assume one is merely a scaled version of the other.

Reuse verified design tokens and existing components before creating new ones. Extend shared components only when the new behavior belongs to their established contract; avoid speculative abstractions based on a single screen.

## Mandatory implementation workflow

Before implementing any screen or composed UI:

1. Identify and read the exact desktop and mobile Figma nodes through Figma MCP.
2. Inspect relevant Style Guide tokens, components, variants, states, and assets.
3. Compare the target with existing project tokens and components.
4. Record ambiguities or design/API conflicts for Codex rather than guessing.
5. Implement against the verified nodes and use actual SVG assets through SVGR.
6. Review the result at relevant viewport sizes against Figma.

Do not copy generated Figma code into this document or treat generated code as an architectural source of truth.
