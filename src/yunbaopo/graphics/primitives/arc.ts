import { cloneDeep } from 'lodash';
import { transformer } from '../utils/transformer'; // 🔥 替换 `origin2RenderR`，统一使用 `transformer`
import { IArc } from '../interface';

export const transformArc = (param: IArc): IArc => {
  const arcParam = cloneDeep(param);

  // 🔥 使用 transformer 进行转换
  arcParam.r = transformer.toCanvasLength(arcParam.r);
  arcParam.startPoint.x = transformer.toCanvasX(arcParam.startPoint.x);
  arcParam.startPoint.y = transformer.toCanvasY(arcParam.startPoint.y);
  arcParam.endPoint.x = transformer.toCanvasX(arcParam.endPoint.x);
  arcParam.endPoint.y = transformer.toCanvasY(arcParam.endPoint.y);
  arcParam.x = transformer.toCanvasX(arcParam.x);
  arcParam.y = transformer.toCanvasY(arcParam.y);

  // 记录原始数据，防止嵌套
  arcParam.origin = param.origin ?? param;

  return arcParam;
};

/**
 * @description 生成 SVG 圆弧路径
 */
export const generateArcPath = (
  arcParam: IArc,
  needM: boolean = true,
  xAxisRotation: number = 0,
  largeArcFlag: number = 0,
  sweepFlag: number = 1,
): string => {
  const { startPoint, endPoint, r, deltaTheta } = arcParam;

  // 判断是否需要 `M` 命令
  const moveCmd = needM ? `M ${startPoint.x} ${startPoint.y} ` : '';

  // 计算大弧标志
  largeArcFlag = deltaTheta < Math.PI ? 0 : 1;

  // 生成路径字符串
  return `${moveCmd}A ${r} ${r} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`.trim();
};
