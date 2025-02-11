import { holeGroupProcessor } from '@/yunbaopo/processors/hole-group-processor';
import { hole } from '../data';
import { fabric } from '@fabric-fusion/core';
import _ from 'lodash';

/**
 * @description 生成炮孔 Fabric.js 对象列表，每个炮孔是独立的 `fabric.Group`
 * @param {object} options - 额外的自定义配置
 * @param {string} [options.fill='#000000'] - 炮孔填充颜色
 * @param {string} [options.stroke='#00e100'] - 炮孔边框颜色
 * @param {number} [options.radius=10] - 炮孔半径（像素）
 * @param {boolean} [options.showText=true] - 是否显示炮孔名称文本
 * @param {string} [options.textColor='#ffffff'] - 文字颜色
 * @param {number} [options.textSize=10] - 文字大小
 * @param {boolean} [options.selectable=false] - 是否允许用户选中
 * @param {Function} [options.onClick] - 炮孔点击回调函数 (holeData) => void
 * @param {Function} [options.onHover] - 炮孔悬停回调函数 (holeData) => void
 * @returns {fabric.Object[]} - 生成的炮孔 Fabric 组对象列表（每个炮孔是 `fabric.Group`）
 */
export const generateHoles = (
  options: {
    fill?: string;
    stroke?: string;
    radius?: number;
    showText?: boolean;
    textColor?: string;
    textSize?: number;
    selectable?: boolean;
    onClick?: (holeData: any) => void;
    onHover?: (holeData: any) => void;
  } = {},
): fabric.Object[] => {
  // 默认参数
  const config = {
    fill: '#000000',
    stroke: '#00e100',
    radius: 10,
    showText: true,
    textColor: '#ffffff',
    textSize: 10,
    selectable: false,
    ...options, // 合并用户自定义参数
  };

  // 生成炮孔组
  const _graphHoleList = holeGroupProcessor(hole);
  console.log('炮孔组数据:', _graphHoleList);

  // 普通数组存储每个 `fabric.Group`，确保它们是独立对象
  const holeObjects: fabric.Object[] = [];

  for (const seqGroupItem of _graphHoleList) {
    const holeGroupList = seqGroupItem.holeList;

    for (const hole of holeGroupList) {
      // 创建炮孔图形
      const circle = new fabric.Circle({
        radius: config.radius,
        fill: config.fill,
        stroke: config.stroke,
        left: hole.x,
        top: hole.y,
        selectable: config.selectable,
        originX: 'center',
        originY: 'center',
      });

      // 创建文本对象（如果需要显示）
      let text: fabric.Text | null = null;
      if (config.showText) {
        text = new fabric.Text(hole.name.toString(), {
          left: hole.x,
          top: hole.y - config.radius - 5, // 文字稍微上移
          fontWeight: 800,
          fontSize: config.textSize,
          originX: 'center',
          originY: 'center',
          selectable: false,
          fill: config.textColor,
        });
      }

      // 组合炮孔与文本
      const mixList: any[] = [circle];
      if (text) mixList.push(text);

      // 创建 Fabric 组（每个炮孔都是独立的 `fabric.Group`）
      const mixedHole = new fabric.Group(mixList, {
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'pointer',
        metaData: { hole },
        selectable: config.selectable,
      } as any);

      // 添加点击事件监听器
      if (config.onClick) {
        mixedHole.on('mousedown', () => config.onClick?.(hole));
      }

      // 添加悬停事件监听器
      if (config.onHover) {
        mixedHole.on('mouseover', () => config.onHover?.(hole));
      }

      // 将炮孔对象存入数组（普通数组，而不是 fabric.Group）
      holeObjects.push(mixedHole);
    }
  }

  return holeObjects;
};
