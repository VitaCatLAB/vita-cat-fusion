import { ZOOM_RANGE } from './config';
import { Canvas, Point } from 'fabric';

/**
 * 注册 Fabric.js 画布的缩放和拖拽事件（Fabric v7 适配）
 */
export const registerCanvasEvents = (
  canvas: Canvas,
  panKey: string = 'Alt',
  minZoom: number = ZOOM_RANGE.min,
  maxZoom: number = ZOOM_RANGE.max,
): (() => void) => {
  let isDragging = false;
  let lastPosX = 0;
  let lastPosY = 0;
  let isPanKeyPressed = false;

  /* ================= 键盘事件 ================= */

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

  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  /* ================= 缩放（滚轮） ================= */

  const handleMouseWheel = (opt: any) => {
    const e = opt.e as WheelEvent;
    if (!e) return;

    let zoom = canvas.getZoom();
    zoom *= 0.999 ** e.deltaY;
    zoom = Math.min(Math.max(zoom, minZoom), maxZoom);

    // v7 推荐使用 Point
    const point = new Point(e.offsetX, e.offsetY);
    canvas.zoomToPoint(point, zoom);

    e.preventDefault();
    e.stopPropagation();
  };

  /* ================= 拖拽 ================= */

  const handleMouseDown = (opt: any) => {
    if (!isPanKeyPressed) return;

    const e = opt.e as MouseEvent;
    isDragging = true;
    lastPosX = e.clientX;
    lastPosY = e.clientY;

    canvas.selection = false;
  };

  const handleMouseMove = (opt: any) => {
    if (!isDragging) return;

    const e = opt.e as MouseEvent;
    const vpt = canvas.viewportTransform;
    if (!vpt) return;

    vpt[4] += e.clientX - lastPosX;
    vpt[5] += e.clientY - lastPosY;

    canvas.setViewportTransform(vpt);

    lastPosX = e.clientX;
    lastPosY = e.clientY;
  };

  const handleMouseUp = () => {
    isDragging = false;
    canvas.selection = true;
  };

  /* ================= 绑定事件 ================= */

  canvas.on('mouse:wheel', handleMouseWheel);
  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  /* ================= 清理函数 ================= */

  return () => {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);

    canvas.off('mouse:wheel', handleMouseWheel);
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
  };
};
