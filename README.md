# ale-janicki.github.io

Personal portfolio: a scroll-driven neural network (one engineer, one system) built with React, Vite, TypeScript and React Three Fiber.

## Run

```bash
pnpm install
pnpm run dev     # http://localhost:5173
pnpm run build   # tsc + vite build + dist/404.html copy
pnpm run lint
```

## Notes

- Projects live in `src/content/projects.ts`; profile text in `src/content/profile.ts`.
- Texts live in `src/i18n` (EN base in `en.ts`, `pt-BR.ts` typed against it) and in the `Localized<T>` content files. drei's `<Html>` renders in its own React root, so inside the canvas use `LocalizedHtml` (re-provides the locale context) instead of drei's `Html`.
- Scroll drives the camera (GSAP ScrollTrigger + Lenis). Click a project node, or use the Projects button for a plain list.
- `prefers-reduced-motion` renders a static network with a 2D layout; no WebGL renders a CSS backdrop with the same 2D layout.
- Deploy: `.github/workflows/deploy.yml` builds and publishes `dist` to GitHub Pages.
