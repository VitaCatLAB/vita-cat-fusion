import { CoordinateTransformer } from '@fabric-fusion/core';
//TODO:考虑是否需要不同的transformer

const t = () => {
  // FIXME:通过外部传入以下信息
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
