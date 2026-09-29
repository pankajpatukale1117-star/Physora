# PHYSORA — MASTER QUALITY, SCIENTIFIC ACCURACY & CONTINUOUS IMPROVEMENT RULE

Every update must follow: UNDERSTAND → MODIFY → TEST → AUDIT → VERIFY MATH/PHYSICS → VERIFY TEXT → VERIFY UI → VERIFY DESKTOP → VERIFY MOBILE → FIX REGRESSIONS → FINAL CHECK

## Key Principles
- Target audience: Class 9–11 students
- Every formula, unit, calculation must be independently verified
- Every displayed number must match the simulation state
- Never assume existing content is correct
- Inspect the WHOLE application before changing anything
- Fix discovered issues immediately (don't wait for user to report)
- Do NOT redesign things that already work well
- Simple concepts explained well > advanced concepts explained badly

## Mandatory Checks
- Scientific/mathematical accuracy (formulas, units, dimensions, edge cases)
- Educational value (does the student understand what/why)
- Visual accuracy (vectors, graphs, trajectories match calculations)
- Desktop layout preserved
- Mobile: large simulations, thumb-friendly controls, no overflow
- Performance: FPS, re-renders, memory
- Consistency across all components
- Error handling (no NaN, Infinity, broken UI)
- Text quality (spelling, grammar, terminology, simplicity)
- Accessibility (contrast, focus, touch targets)

## Test Viewports
Desktop: 1280px, 1440px, 1920px
Mobile: 320px, 360px, 375px, 390px, 414px
