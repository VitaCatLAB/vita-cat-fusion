import { CoordinateTransformer } from '@fabric-fusion/core';

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
