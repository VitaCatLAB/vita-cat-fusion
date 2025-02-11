import { cloneDeep } from 'lodash';
import { transformer } from '../utils/transformer'; // ✅ 统一转换逻辑
import { ILine } from '../interface';

/**
 * @description  将线段数据转换为渲染坐标系的数据
 * @param {ILine} param - 原始线段数据
 * @return {ILine} 转换后的线段数据
 */
export const transformLine = (param: ILine): ILine => {
  const lineParam = cloneDeep(param);

  // 🔥 使用 `transformer` 进行坐标转换
  lineParam.p1.x = transformer.toCanvasX(lineParam.p1.x);
  lineParam.p1.y = transformer.toCanvasY(lineParam.p1.y);
  lineParam.p2.x = transformer.toCanvasX(lineParam.p2.x);
  lineParam.p2.y = transformer.toCanvasY(lineParam.p2.y);

  // ✅ 防止 `origin` 无限嵌套，只存储最初的 `param`
  lineParam.origin = param.origin ?? param;

  return lineParam;
};

/**
 * @description  生成 SVG 线段路径
 * @param {ILine} lineParam - 线段参数
 * @param {boolean} [needM=false] - 是否需要 `M` 命令移动到起点
 * @return {string} SVG 路径字符串
 */
export const generateLinePath = (lineParam: ILine, needM: boolean = false): string => {
  const { p1, p2 } = lineParam;

  // ✅ 直接构造 SVG `L` 线段路径
  return `${needM ? `M ${p1.x} ${p1.y} ` : ''}L ${p2.x} ${p2.y}`.trim();
};
