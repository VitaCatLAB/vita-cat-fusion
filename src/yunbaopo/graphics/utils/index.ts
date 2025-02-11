import { CoordinateTransformer } from '@fabric-fusion/core';

interface Point {
  x: number;
  y: number;
}
const t = () => {
  const h = 598;
  const w = 1539;

  // const t = new CoordinateTransformer(w, h);
  const t = new CoordinateTransformer({
    canvasWidth: w,
    canvasHeight: h,
    yOffset: -200,
  });
  return t;
};

export const transformer = t();
export const computeLength = (h1: Point, h2: Point) => {
  const x1 = h1.x;
  const y1 = h1.y;
  const x2 = h2.x;
  const y2 = h2.y;
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  return length;
};
