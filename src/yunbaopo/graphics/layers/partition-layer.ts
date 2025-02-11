import { fabric } from '@fabric-fusion/core';
import { partition } from '../data';
import { IGraphType, Partition } from '../interface';
import { partitionProcessor } from '@/yunbaopo/processors/partition-processor';
import { genPartitionName } from '../utils/name-generator';
import { generateArcPath } from '../primitives/arc';
import { generateLinePath } from '../primitives/line';

/**
 * @description 生成炮孔 Fabric.js 对象列表，每个元素是独立的 `fabric.Group`
 * @param {object} options - 额外的自定义配置
 * @param {string} [options.fill='#000000'] - 炮孔填充颜色
 * @param {Function} [options.onClick] - 炮孔点击回调函数 (data) => void
 * @param {Function} [options.onHover] - 炮孔悬停回调函数 (data) => void
 * @returns {fabric.Object[]} - 生成的炮孔 Fabric 组对象列表（每个炮孔是 `fabric.Group`）
 */
export const generatePartition = (
  options: {
    fill?: string;
    onClick?: (data: any) => void;
    onHover?: (data: any) => void;
  } = {},
): fabric.Object[] => {
  // 默认参数
  const config = {
    fill: '#000000',
    stroke: '#00e100',
    radius: 10,
    ...options, // 合并用户自定义参数
  };

  // 普通数组存储每个 `fabric.Group`，确保它们是独立对象
  const fabricObjects: fabric.Object[] = [];

  ///绘制图形///

  const _partitionList: Partition[] = partitionProcessor(partition.partitionList);

  // 遍历每个分区
  for (const partition of _partitionList) {
    let pathData = ''; // 初始化路径数据字符串

    // 遍历每个图形参数，根据类型生成相应路径
    for (const param of partition.graphList) {
      if (param.type === IGraphType.ARC) {
        pathData += generateArcPath(param); // 如果是弧形，调用 arcPath 生成路径
      } else if (param.type === IGraphType.LINE) {
        pathData += generateLinePath(param, true); // 如果是直线，调用 linePath 生成路径
      }
    }

    // 使用生成的路径数据创建 fabric.Path 对象
    const path = new fabric.Path(pathData);

    // 设置路径属性：透明填充，黑色虚线描边，透明度 0.5
    path.set({
      fill: 'transparent',
      stroke: 'black',
      strokeDashArray: [5, 5], // 虚线间隔
      opacity: 1,
      name: genPartitionName('A#' + partition.name), // 生成分区名称
    });

    // 获取路径的中心点，用于文本的定位
    const centerPoint = path.getCenterPoint();

    // 创建分区名称文本对象，位置在路径的中心点
    const text = new fabric.Text(partition.name, {
      top: centerPoint.y,
      left: centerPoint.x,
      fontSize: 10, // 设置字体大小为 10
      originX: 'center',
      originY: 'center',
      name: genPartitionName('B#' + partition.name),
      opacity: 0.2, // 设置文本透明度
    });

    // 创建一个 fabric.Group 对象，将路径和文本组合在一起
    const groupItem = new fabric.Group([path, text], {
      subTargetCheck: true, // 启用子元素的点击检测
      metaData: {
        partition: partition, // 将分区数据绑定到组的元数据中
      },
    } as any);

    // 设置组合项的属性，包括禁止移动、设置边框颜色等
    groupItem.set({
      lockMovementX: true, // 禁止横向移动
      lockMovementY: true, // 禁止纵向移动
      borderColor: 'blue', // 设置边框颜色为蓝色
      borderScaleFactor: 2, // 边框缩放因子
      cornerColor: 'blue', // 设置控制点颜色为蓝色
      cornerSize: 6, // 设置控制点大小为 6
      hasControls: false, // 禁用控制点
      padding: 5, // 设置内边距为 5
    });

    const data = {
      partition: partition,
    };

    // 添加点击事件监听器
    if (config.onClick) {
      groupItem.on('mousedown', () => config.onClick?.(data));
    }

    // 添加悬停事件监听器
    if (config.onHover) {
      groupItem.on('mouseover', () => config.onHover?.(data));
    }
    fabricObjects.push(groupItem);
  }

  return fabricObjects;
};
