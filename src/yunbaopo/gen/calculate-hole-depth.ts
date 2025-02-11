export const genHoleDepth = (hole: any) => {
  let depth = 0;
  depth = Math.sqrt(Math.pow(hole.l, 2) - Math.pow(hole.d, 2));

  return depth;
};
