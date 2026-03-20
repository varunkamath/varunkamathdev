export const SHAPES = [
  { name: 'torus', id: 0 },
  { name: 'trefoil knot', id: 1 },
  { name: 'enneper surface', id: 2 },
  { name: "dini's surface", id: 3 },
  { name: 'breather surface', id: 4 },
] as const;

export const SHAPE_COUNT = SHAPES.length;

export const ACCENT_COLOR = [0.75, 0.85, 0.95] as const; // cool white-blue
