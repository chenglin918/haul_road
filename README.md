# Haul Road Performance Simulator

Interactive React/Vite app for exploring haul-truck rolling resistance using two side-by-side approaches:

- **Method A:** equivalent linear operational estimate
- **Method B:** geometric Boussinesq-based calculation derived from Joseph, Curley, and Anand (2017)

The UI exposes hauler and surface parameters, renders the governing equations with KaTeX, compares wearing-course materials, and links to the supporting PDF briefs included in the repository.

## Project structure

- `/home/runner/work/haul_road/haul_road/src/App.jsx` - main simulator UI, equations, and chart data generation
- `/home/runner/work/haul_road/haul_road/src/index.css` and `/home/runner/work/haul_road/haul_road/src/App.css` - styling
- `/home/runner/work/haul_road/haul_road/sample_calculation.md` - worked example of the simulator math
- `/home/runner/work/haul_road/haul_road/kp_determination_briefing.md` - field protocol background
- `/home/runner/work/haul_road/haul_road/.github/workflows/deploy.yml` - GitHub Pages deployment workflow

## Local development

```bash
npm ci
npm run lint
npm run build
npm run dev
```

## Codebase analysis

Current strengths:

- The app already communicates the domain model clearly through in-app theory panels and downloadable reference material.
- The deployment workflow is lightweight and production-ready for GitHub Pages.
- The calculation flow is transparent enough to trace from slider inputs to displayed results.

Main improvement opportunities:

1. **Split `src/App.jsx` into smaller modules.**
   The main component currently owns inputs, both calculation pipelines, equation rendering, chart generation, and long-form explanatory UI. Extracting calculation helpers and presentation components would make future review and testing much easier.
2. **Add automated tests for the rolling-resistance formulas.**
   The project has build and lint checks, but no test suite for the mathematical outputs. Even a small set of deterministic unit tests around the default parameters would protect the engineering calculations from regressions.
3. **Separate deterministic math from demo-only trace generation.**
   The live chart currently mixes the core formulas with randomized bounce data. Moving those calculations into pure helpers would improve reproducibility and simplify verification.
4. **Keep generated Vite artifacts out of the lint/build surface.**
   Repository validation is cleaner when cache artifacts such as `.vite` are ignored, leaving lint focused on maintained source files.
5. **Document coefficient provenance near the implementation.**
   Constants such as the linear-model baseline and scaling coefficients are easier to trust and maintain when their engineering source or rationale is cited close to the code.

## Validation notes

- `npm run build` succeeds in this repository.
- `npm run lint` now targets the maintained source tree without traversing Vite cache artifacts.
