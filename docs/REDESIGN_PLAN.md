# Truxel Redesign Plan: "The Digital Truck Stop"

## 1. Brand Identity & Vision
**Concept:** "The Sign on the Highway"
**Target Audience:** OTR (Over-The-Road) Truck Drivers.
**Vibe:** Reliable, High-Visibility, Open, Strong Contrast.
**Metaphor:** The app is the "Truck Stop" - a safe, bright, and useful place to pull over digitally.

## 2. Proposed Color Palette (Uniform Web & App)

We will move away from the "all over the place" colors to a strict, high-contrast system.

### Primary Colors (The Brand)
*   **Highway Blue (`#0052CC` or `#1E40AF`)**: The core brand color. Reminiscent of interstate information signs. Used for headers, primary actions, and branding.
    *   *Current:* `#2563eb` (Tailwind Blue-600).
    *   *Proposed:* A slightly deeper, more authoritative blue, e.g., **`#1565C0` (Blue 800)**.

### Accent Colors (The Contrast)
*   **Signal Amber (`#FFC107`)** or **Safety Orange (`#FF5722`)**: High-visibility accents for "Call to Action" buttons, notifications, and highlights. This provides the "strong contrast" requested.
    *   *Recommendation:* **Amber/Gold** pairs beautifully with Blue and evokes truck marker lights.

### Neutral Colors (The Road & Sky)
*   **Background:** **`#F8FAFC` (Slate 50)**. A very clean, "open" white-gray. Not harsh white, but bright and airy.
*   **Surface (Cards/Modals):** **`#FFFFFF` (Pure White)**.
*   **Text (Primary):** **`#0F172A` (Slate 900)**. "Asphalt" dark. Maximum readability.
*   **Text (Secondary):** **`#64748B` (Slate 500)**. "Concrete" gray for subtitles.

### Semantic Colors (Status)
*   **Success:** `#10B981` (Emerald) -> Keep, it's standard and clear.
*   **Error:** `#EF4444` (Red) -> Keep, high visibility.

## 3. UI/UX Design Language
*   **"Big & Tappable":** Drivers often have larger hands or use phones in mounts. Buttons should be full-width or large pill shapes.
*   **"Daylight Readability":** High contrast text is non-negotiable. No light gray text on white backgrounds.
*   **"Clean Cards":** Content contained in distinct white cards with subtle shadows (elevation) against the light gray background.

## 4. Implementation Strategy

### Phase 1: Centralize the Theme
1.  Update `lib/theme.tsx` with the new palette.
2.  Define semantic names: `theme.colors.primary`, `theme.colors.accent`, `theme.colors.pageBackground`.

### Phase 2: Eradicate Hardcoded Colors
We have identified ~300 instances of hardcoded colors (e.g., `#2563EB`, `#10B981`).
*   **Action:** Replace all hex codes in `components/` and `app/` with `theme.colors.X`.
*   **Tooling:** Use regex search/replace to map old hexes to new theme tokens.

### Phase 3: Component Standardization
*   **Buttons:** Create a unified `<Button>` component that strictly follows the theme (Primary vs. Outline vs. Ghost).
*   **Inputs:** Standardize borders and focus states to use the Primary color.
*   **Headers:** Ensure Web and Mobile headers share the exact same "Highway Blue" styling.

## 5. Questions for You
1.  **Logo Colors:** Can you confirm the exact colors in your logo? (Or should I pick the best matching "Highway Blue" and "Signal Amber"?).
2.  **Dark Mode:** Do we need to support Dark Mode immediately (Night Driving mode)? The plan above focuses on a "Clean/Open" Light mode first.

---
**Next Step:** If you approve this direction, I will update `lib/theme.tsx` with the new "Highway" palette and start the refactoring process.
