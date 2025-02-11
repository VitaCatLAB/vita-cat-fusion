// 定义 isGreat 函数，比较 value 是否大于 threshold
const isGreat = (value: number, threshold: number): boolean => {
  return value > threshold; // 返回 value 是否大于 threshold 的布尔值
};

// 定义 computeInnerXY 函数，计算炮孔的孔底坐标
export const genInnerXY = (hole: any) => {
  // 初始化孔底的 X 和 Y 坐标，默认为孔的初始 X 和 Y 坐标
  let innerX = hole.x;
  let innerY = hole.y;
  // 判断孔的投影长度 d 是否大于 0，即孔是否有投影
  if (isGreat(hole.d, 0)) {
    // 如果有投影，计算投影向量的分量 deltaX 和 deltaY
    const deltaX = hole.d * Math.cos(hole.angle); // 计算投影在 X 方向的分量
    const deltaY = hole.d * Math.sin(hole.angle); // 计算投影在 Y 方向的分量

    // 根据投影向量，计算孔底的实际坐标
    innerX = innerX - deltaX; // 孔底的 X 坐标 = 原始 X 坐标 - X 方向的投影分量
    innerY = innerY + deltaY; // 孔底的 Y 坐标 = 原始 Y 坐标 + Y 方向的投影分量
  }
  return { innerX, innerY };
};
