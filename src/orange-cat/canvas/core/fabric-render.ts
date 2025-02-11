import { DEFAULT_BACKGROUND_COLOR, DEBOUNCE_DELAY } from './config';
import { registerCanvasEvents } from './events';
import _fabric from 'fabric';

export const fabric = _fabric.fabric;

export interface FabricRenderOptions extends fabric.ICanvasOptions {
  backgroundColor?: string;
  enableDefaultListeners?: boolean; // 是否启用默认监听事件
  customListeners?: Record<string, (opt: any) => void>; // 自定义事件监听器
}

export class FabricRender {
  public canvas: fabric.Canvas = new fabric.Canvas(null); // 画布实例
  private container: HTMLElement | null = null; // 画布容器
  private resizeObserver: ResizeObserver | null = null; // ResizeObserver 实例
  private debouncedResize: (event: UIEvent) => void; // 防抖后的调整函数
  private fixedObjects: Set<fabric.Object> = new Set(); // 存储固定大小的对象

  constructor() {
    this.debouncedResize = this.debounce(this.adjustCanvasSize.bind(this), DEBOUNCE_DELAY); // 初始化防抖函数
  }

  /**
   * @description 初始化画布
   * @param {HTMLCanvasElement} canvasEl - 画布元素
   * @param {FabricRenderOptions} options - 画布配置选项
   * @param {HTMLElement} container - 画布容器
   */
  public init(
    canvasEl: HTMLCanvasElement,
    options: FabricRenderOptions = {},
    container: HTMLElement | null = null,
  ): void {
    if (!canvasEl || !container) {
      throw new Error('Canvas element and container are required.');
    }
    this.container = container;

    // 初始化 Fabric.js 画布
    this.canvas = new fabric.Canvas(canvasEl, {
      backgroundColor: options.backgroundColor || DEFAULT_BACKGROUND_COLOR,
      ...options,
    });

    // 添加默认监听事件
    if (options.enableDefaultListeners) {
      registerCanvasEvents(this.canvas);
    }

    // 添加自定义监听事件
    if (options.customListeners) {
      for (const [eventName, handler] of Object.entries(options.customListeners)) {
        this.canvas.on(eventName, handler);
      }
    }

    // 初始化 ResizeObserver 和窗口监听
    this.initResizeListener();

    // 监听画布缩放事件，动态调整固定大小对象
    this.canvas.on('mouse:wheel', () => this.adjustFixedObjects());
  }

  /**
   * @description 调整画布尺寸
   */
  private adjustCanvasSize(): void {
    if (this.container) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.canvas.setDimensions({ width, height });
      this.canvas.requestRenderAll();
    }
  }

  /**
   * @description 动态调整固定大小对象的缩放
   */
  private adjustFixedObjects(): void {
    const currentZoom = this.canvas.getZoom();
    this.fixedObjects.forEach((obj) => {
      const initialScaleX = (obj as any).__initialScaleX;
      const initialScaleY = (obj as any).__initialScaleY;
      if (initialScaleX !== undefined && initialScaleY !== undefined) {
        obj.set({
          scaleX: initialScaleX / currentZoom,
          scaleY: initialScaleY / currentZoom,
        });
      }
    });
    this.canvas.requestRenderAll();
  }

  /**
   * @description 初始化尺寸监听器
   */
  private initResizeListener(): void {
    if (!this.container) return;

    // 使用 ResizeObserver 监听容器尺寸变化
    this.resizeObserver = new ResizeObserver(() => {
      this.debouncedResize({} as UIEvent); // 传递一个空对象模拟 UIEvent
    });
    this.resizeObserver.observe(this.container);

    // 添加全局窗口大小变化监听
    window.addEventListener('resize', this.debouncedResize as (event: UIEvent) => void);
  }

  /**
   * @description 清理监听器
   */
  public clearListeners(): void {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // 移除全局窗口监听
    window.removeEventListener('resize', this.debouncedResize as (event: UIEvent) => void);
  }

  /**
   * @description 清理画布和资源
   */
  public dispose(): void {
    this.clearListeners();
    this.canvas.dispose();
  }

  /**
   * @description 防抖函数
   * @param {Function} func - 需要防抖的函数
   * @param {number} delay - 防抖延迟时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  private debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ): (event: UIEvent) => void {
    let timeout: number | null = null;
    return function (this: Window, ...args: any[]) {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * @description 添加对象到画布
   * @param {...fabric.Object[]} objects - 添加的对象
   * @param {boolean} isFixed - 是否为固定大小对象
   */
  public add(objects: fabric.Object[], isFixed: boolean = false): void {
    objects.forEach((obj) => {
      if (isFixed) {
        // 标记固定大小的对象
        this.fixedObjects.add(obj);
        (obj as any).__initialScaleX = obj.scaleX || 1;
        (obj as any).__initialScaleY = obj.scaleY || 1;
      }
      this.canvas.add(obj);
    });
  }

  /**
   * @description 清空画布
   */
  public clear(): void {
    this.canvas.clear();
    this.fixedObjects.clear();
  }
}
