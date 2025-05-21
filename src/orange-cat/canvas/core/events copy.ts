import { ZOOM_RANGE } from './config';

/**
 * 注册 Fabric.js 画布的缩放和拖拽事件。
 * @param canvas - Fabric.js 画布实例
 * @param panKey - 启用拖拽的快捷键（默认 Alt，可设置为 ' '、'Shift' 等）
 * @returns 清理事件监听器的函数
 */
export const registerCanvasEvents = (
  canvas: fabric.Canvas,
  panKey: string = 'Alt',
): (() => void) => {
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let isPanKeyPressed = false;

  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === panKey.toLowerCase()) {
      isPanKeyPressed = true;
    }
  };

  const keyUpHandler = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === panKey.toLowerCase()) {
      isPanKeyPressed = false;
    }
  };

  // 注册键盘事件
  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  // 缩放事件（滚轮）
  const handleMouseWheel = (opt: fabric.IEvent<Event>) => {
    const evt = opt.e as WheelEvent;
    const delta = evt.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    zoom = Math.min(Math.max(zoom, ZOOM_RANGE.min), ZOOM_RANGE.max); // 限制缩放范围

    // console.log('opt', opt);
    const pointer: fabric.IPoint = { x: evt.offsetX, y: evt.offsetY }; // 获取鼠标位置

    canvas.zoomToPoint(pointer, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  // 拖拽开始
  const handleMouseDown = (opt: fabric.IEvent<Event>) => {
    if (isPanKeyPressed) {
      const evt = opt.e as MouseEvent;
      isDragging = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      canvas.selection = false;
    }
  };

  // 拖拽移动
  const handleMouseMove = (opt: fabric.IEvent<Event>) => {
    if (isDragging) {
      const evt = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform!;
      vpt[4] += evt.clientX - lastPosX;
      vpt[5] += evt.clientY - lastPosY;
      canvas.setViewportTransform(vpt);
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    isDragging = false;
    canvas.selection = true;
    console.log('fabric-fusion/core: 拖拽结束');
  };

  // 绑定事件
  canvas.on('mouse:wheel', handleMouseWheel);
  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  // 返回清理函数
  return () => {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    canvas.off('mouse:wheel', handleMouseWheel);
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
  };
};
