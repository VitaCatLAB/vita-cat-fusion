import { fabric } from 'fabric';
import { ZOOM_RANGE } from './config';

/**
 * @description 注册默认事件到 Fabric.js 画布
 * @param {fabric.Canvas} canvas - Fabric.js 画布实例
 */
export const registerCanvasEvents = (canvas: fabric.Canvas): void => {
  let isDragging = false; // 是否正在拖拽
  let lastPosX = 0; // 上一次拖拽的 X 坐标
  let lastPosY = 0; // 上一次拖拽的 Y 坐标

  // 滚轮缩放事件
  canvas.on('mouse:wheel', (opt: any) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    zoom = Math.min(Math.max(zoom, ZOOM_RANGE.min), ZOOM_RANGE.max); // 限制缩放范围

    // console.log('opt', opt);
    const pointer: fabric.IPoint = { x: opt.e.offsetX, y: opt.e.offsetY }; // 获取鼠标位置

    canvas.zoomToPoint(pointer, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // 拖拽开始事件
  canvas.on('mouse:down', (opt: any) => {
    const evt = opt.e;
    if (evt.altKey) {
      // 按住 Alt 键启用拖拽
      isDragging = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      canvas.selection = false;
    }
  });

  // 拖拽移动事件
  canvas.on('mouse:move', (opt: any) => {
    if (isDragging) {
      const evt = opt.e;
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      vpt[4] += evt.clientX - lastPosX;
      vpt[5] += evt.clientY - lastPosY;
      canvas.setViewportTransform(vpt);
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    }
  });

  // 拖拽结束事件
  canvas.on('mouse:up', () => {
    isDragging = false;
    canvas.selection = true;
  });

  // 对象移动事件
  canvas.on('object:moving', (opt: any) => {
    console.log('对象正在移动:', opt.target);
  });

  // 鼠标点击事件（示例）
  canvas.on('mouse:down', (opt: any) => {
    const pointer = canvas.getPointer(opt.e);
    console.log(`鼠标点击位置: X=${pointer.x}, Y=${pointer.y}`);
  });
};
