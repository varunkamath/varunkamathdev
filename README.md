# varunkamath.dev

Personal portfolio. A swarm of boid particles forming 3D parametric surfaces — torus, trefoil knot, Enneper surface, Dini's surface, and breather surface. Particles follow flocking rules (separation, alignment, cohesion) while converging on shape target points, scattering and reforming on morph transitions.

Interactive: mouse hover repulsion, click to attract, long-press to repel, drag to guide the swarm. On mobile: gyroscope camera control and shake to scatter.

Next.js 16 / React 19 / Three.js / Tailwind CSS v4 / TypeScript

## Dev

```
pnpm install
pnpm dev
```

## Lint / Format

```
pnpm lint
pnpm fmt
```

## Deploy

Push to `main`. Vercel builds automatically.
