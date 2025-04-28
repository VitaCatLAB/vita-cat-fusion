import { reactive } from 'vue';
import { fabric } from 'fabric';

/**
 * Tooltip 管理逻辑
 */
export function useTooltip() {
  const tooltip = reactive({
    visible: false,
    content: '',
    x: 0,
    y: 0,
    position: 'TL' as 'TL' | 'TR' | 'BL' | 'BR', // 默认位置：左上
  });

  /**
   * 鼠标移动时更新 tooltip
   * @param opt Fabric 事件对象
   * @param canvas 当前的 Fabric 画布实例
   */
  const tooltipMouseMove = (opt: fabric.IEvent, canvas: fabric.Canvas) => {
    const target = opt.target as any;

    if (target && target.tooltip) {
      tooltip.visible = true;
      tooltip.content = target.tooltip;

      const viewportTransform = canvas.viewportTransform;
      if (viewportTransform) {
        const centerPoint = new fabric.Point(target.left ?? 0, target.top ?? 0);
        const transformedPoint = fabric.util.transformPoint(centerPoint, viewportTransform);
        tooltip.x = transformedPoint.x;
        tooltip.y = transformedPoint.y;
      } else {
        tooltip.x = target.left ?? 0;
        tooltip.y = target.top ?? 0;
      }

      tooltip.position = target.tooltipPosition || 'TL';
    } else {
      tooltip.visible = false;
    }
  };

  /**
   * 鼠标移出时隐藏 tooltip
   */
  const tooltipMouseOut = () => {
    tooltip.visible = false;
  };

  return { tooltip, tooltipMouseMove, tooltipMouseOut };
}
