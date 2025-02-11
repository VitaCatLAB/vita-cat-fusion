export const genHoleLength = (hole: any) => {
  let l = 0;
  l = Math.sqrt(Math.pow(hole.depth, 2) + Math.pow(hole.d, 2));

  return l;
};
