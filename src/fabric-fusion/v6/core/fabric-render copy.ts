import { DEFAULT_BACKGROUND_COLOR } from './config';
import { fabric as _fabric } from 'fabric';

export interface FabricRenderOptions {
  backgroundColor?: string;
  enableDefaultListeners?: boolean; // 是否启用默认监听事件
  customListeners?: Record<string, (opt: any) => void>; // 自定义事件监听器
}

export const fabric = _fabric;

export class FabricRender {
  public canvas: fabric.Canvas = new fabric.Canvas(null); // 画布实例
  private container: HTMLElement | null = null; // 画布容器
  private resizeObserver: ResizeObserver | null = null; // ResizeObserver 实例
  private debouncedResize: (event: UIEvent) => void; // 防抖后的调整函数
  private isDragging = false; // 拖拽状态
  private lastPosX = 0; // 拖拽的最后位置X
  private lastPosY = 0; // 拖拽的最后位置Y

  constructor() {
    this.debouncedResize = this.debounce(this.adjustCanvasSize.bind(this), 100); // 初始化防抖函数
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
      this.setDefaultListeners();
    }

    // 添加自定义监听事件
    if (options.customListeners) {
      for (const [eventName, handler] of Object.entries(options.customListeners)) {
        this.canvas.on(eventName, handler);
      }
    }

    // 初始化 ResizeObserver 和窗口监听
    this.initResizeListener();
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
   * @description 设置默认事件监听器
   */
  private setDefaultListeners(): void {
    // 滚轮缩放事件
    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.25), 4); // 限制缩放范围
      // const pointer = this.canvas.getPointer(opt.e);
      const pointer: { x: number; y: number } = { x: opt.e.offsetX, y: opt.e.offsetY }; // 获取鼠标位置

      this.canvas.zoomToPoint(pointer, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // 拖拽事件
    this.canvas.on('mouse:down', (opt: any) => {
      const evt = opt.e;
      if (evt.altKey) {
        // 按住 Alt 键启用拖拽
        this.isDragging = true;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
        this.canvas.selection = false;
      }
    });

    this.canvas.on('mouse:move', (opt: any) => {
      if (this.isDragging) {
        const evt = opt.e;
        const vpt = this.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        vpt[4] += evt.clientX - this.lastPosX;
        vpt[5] += evt.clientY - this.lastPosY;
        this.canvas.setViewportTransform(vpt);
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      this.isDragging = false;
      this.canvas.selection = true;
    });

    // 对象移动事件
    this.canvas.on('object:moving', (opt) => {
      console.log('对象正在移动:', opt);
    });
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
   */
  public add(...objects: fabric.Object[]): void {
    this.canvas.add(...objects);
  }

  /**
   * @description 清空画布
   */
  public clear(): void {
    this.canvas.clear();
  }
}
