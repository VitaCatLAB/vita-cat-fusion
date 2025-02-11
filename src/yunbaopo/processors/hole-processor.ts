import _, { cloneDeep } from 'lodash'; // 引入 lodash 工具库，并导入 `cloneDeep` 进行深拷贝
import { genInnerXY } from '../gen/generate-inner-xy'; // 导入计算炮孔内部 XY 坐标的方法
import { genHoleDepth } from '../gen/calculate-hole-depth'; // 导入计算炮孔深度的方法
import { computeLength, transformer } from '../graphics/utils'; // 导入计算长度及坐标转换工具
import { Hole } from '../graphics/interface'; // 导入炮孔数据接口

const MAX_DISTANCE = 200; // 设定最大炮孔分组距离（单位：毫米）

/**
 * @description 处理并转换炮孔数据
 * @param {any[]} originData - 原始炮孔数据数组
 * @returns {any[]} 经过转换后的炮孔数据列表
 */
export const processHoles = (originData: any[]): any[] => {
  // 对原始数据进行深拷贝，防止修改原数据
  const holeList = cloneDeep(originData) || [];

  // 遍历炮孔数据，计算相关参数并进行坐标转换
  holeList.forEach((hole) => {
    const innerPoint = genInnerXY(hole); // 计算炮孔的内部 XY 坐标
    const holeDepth = genHoleDepth(hole); // 计算炮孔深度
    hole.holeDepth = holeDepth; // 赋值炮孔深度
    hole.innerX = innerPoint.innerX; // 赋值内部 X 坐标
    hole.innerY = innerPoint.innerY; // 赋值内部 Y 坐标
    hole.origin = cloneDeep(hole); // 记录原始数据

    // 进行坐标转换，使其适应画布显示
    hole.x = transformer.toCanvasX(hole.x); // 转换 X 坐标
    hole.y = transformer.toCanvasY(hole.y); // 转换 Y 坐标
    hole.holeDepth = transformer.toCanvasLength(hole.holeDepth); // 转换炮孔深度
    hole.innerX = transformer.toCanvasX(hole.innerX); // 转换内部 X 坐标
    hole.innerY = transformer.toCanvasY(hole.innerY); // 转换内部 Y 坐标
  });

  return holeList; // 返回转换后的炮孔数据
};

/**
 * @description 对炮孔数据进行分组
 * @param {Hole[]} holeList - 经过转换后的炮孔数据列表
 * @returns {any[]} 分组后的炮孔数据
 */
export const groupHoles = (holeList: Hole[]): any[] => {
  const holeGroup: any[] = []; // 初始化炮孔分组数组

  // 依据 `seq`（序列号）进行分组
  const groupedBySeq: { [key: string]: Hole[] } = holeList.reduce(
    (acc, hole) => {
      const seq = hole.seq; // 获取炮孔序列号
      if (!acc[seq]) acc[seq] = []; // 如果该序列号的分组不存在，则创建新数组
      acc[seq].push(hole); // 将当前炮孔加入相应的分组
      return acc;
    },
    {} as { [key: string]: Hole[] }, // 指定数据结构
  );

  // 遍历每一个分组
  for (const seq in groupedBySeq) {
    if (Object.prototype.hasOwnProperty.call(groupedBySeq, seq)) {
      const seqHoleList = groupedBySeq[seq]; // 获取当前序列号的炮孔列表

      // 遍历该组内的所有炮孔
      for (let index = 0; index < seqHoleList.length; index++) {
        const currentSeqHole = seqHoleList[index]; // 当前炮孔
        const prevSeqHole = seqHoleList[index - 1]; // 前一个炮孔（第一个时为空）

        if (index === 0) {
          // 如果是当前序列号组的第一个炮孔，则新建一个炮孔组
          holeGroup.push({
            seq: Number(seq), // 序列号
            seqIndex: 0, // 当前组的索引
            holeList: [currentSeqHole], // 存入当前炮孔
          });
        } else {
          // 计算当前炮孔与前一个炮孔之间的距离
          const distance = computeLength(prevSeqHole.origin, currentSeqHole.origin);

          if (distance > MAX_DISTANCE) {
            // 如果距离超过 `MAX_DISTANCE`，则新建一个炮孔组
            holeGroup.push({
              seq: Number(seq),
              seqIndex: holeGroup[holeGroup.length - 1].seqIndex + 1, // 计算新组索引
              holeList: [currentSeqHole], // 该炮孔作为新组的第一个成员
            });
          } else {
            // 如果距离小于 `MAX_DISTANCE`，则将该炮孔加入当前组
            holeGroup[holeGroup.length - 1].holeList.push(currentSeqHole);
          }
        }
      }
    }
  }

  return holeGroup; // 返回最终的分组数据
};

/**
 * @description 处理炮孔数据并进行分组
 * @param {any[]} originData - 原始炮孔数据数组
 * @returns {any[]} 处理并分组后的炮孔数据
 */
export const holeGroupProcessor = (originData: any[]): any[] => {
  // 深拷贝原始数据，防止修改原数据
  const holeList = cloneDeep(originData) || [];

  // 处理炮孔数据（计算内部坐标、深度、坐标转换）
  const transformedHoleList = processHoles(holeList);

  // 对炮孔数据进行分组
  const holeGroupList = groupHoles(transformedHoleList);

  return holeGroupList; // 返回最终分组的炮孔数据
};
