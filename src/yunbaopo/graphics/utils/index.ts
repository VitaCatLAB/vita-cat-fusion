import { IPoint } from '../interface';

export * from './transformer';
export * from './name-generator';

export const computeLength = (h1: IPoint, h2: IPoint) => {
  const x1 = h1.x;
  const y1 = h1.y;
  const x2 = h2.x;
  const y2 = h2.y;
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  return length;
};
