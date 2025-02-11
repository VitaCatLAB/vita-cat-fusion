import { IPoint } from '../interface';
import { transformer } from '../utils/transformer';

/**
 * @description 将坐标点数据转换为渲染坐标系的数据
 * @param {IPoint} param - 原始坐标点数据
 * @return {IPoint} 转换后的坐标点数据
 */
export const transformPoint = (param: IPoint): IPoint => {
  const pointParam = { ...param }; // 浅拷贝，避免 `cloneDeep` 的性能开销

  pointParam.x = transformer.toCanvasX(pointParam.x);
  pointParam.y = transformer.toCanvasY(pointParam.y);

  pointParam.origin = param.origin ?? param;

  return pointParam;
};
