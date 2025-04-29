import { reactive, onUnmounted } from 'vue';
import { fabric } from 'fabric';

/**
 * Tooltip 管理逻辑（带延时显示）
 */
export function useTooltip(delay = 1000) {
  const tooltip = reactive({
    visible: false,
    content: '',
    x: 0,
    y: 0,
    position: 'TL' as 'TL' | 'TR' | 'BL' | 'BR',
  });

  let showTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 鼠标移动时更新 tooltip（带延迟）
   * @param opt Fabric 事件对象
   * @param canvas 当前的 Fabric 画布实例
   */
  const tooltipMouseMove = (opt: fabric.IEvent, canvas: fabric.Canvas) => {
    const target = opt.target as any;

    // 移动到有 tooltip 的对象
    if (target && target.tooltip) {
      if (showTimer) clearTimeout(showTimer);

      showTimer = setTimeout(() => {
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
      }, delay);
    } else {
      // 移动到没有 tooltip 的对象，取消定时器，隐藏
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }
      tooltip.visible = false;
    }
  };

  /**
   * 鼠标移出时隐藏 tooltip
   */
  const tooltipMouseOut = () => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    tooltip.visible = false;
  };

  onUnmounted(() => {
    if (showTimer) {
      clearTimeout(showTimer);
    }
  });

  return { tooltip, tooltipMouseMove, tooltipMouseOut };
}
