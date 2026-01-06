import { CanvasOptions, FabricObject, config, Canvas } from 'fabric';

import { DEBOUNCE_DELAY } from './config';
import { registerCanvasEvents } from './events';
import { FabricLayerManager } from './fabric-layer-manager';
import * as fabric from 'fabric';
export { fabric };
export type FabricCanvasOptions = Partial<CanvasOptions>;
export interface FabricFusionOptions {
  /** 是否启用默认交互事件 */
  enableDefaultListeners?: boolean;

  /** 自定义事件监听 */
  customListeners?: Record<string, (opt: any) => void>;

  /** 拖动画布的组合键 */
  panKey?: string;

  /** 缩放限制 */
  minZoom?: number;
  maxZoom?: number;
}
export interface FabricRenderInitOptions {
  fabric?: FabricCanvasOptions;
  fusion?: FabricFusionOptions;
}
export class FabricRender {
  /** Fabric v7 Canvas 实例 */
  public canvas!: Canvas;

  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private debouncedResize: () => void;

  /** 固定屏幕尺寸的对象集合 */
  private fixedObjects = new Set<FabricObject>();

  /** 默认事件清理函数 */
  private cleanupCanvasEvents?: () => void;

  public layerManager?: FabricLayerManager;

  constructor() {
    this.debouncedResize = this.debounce(this.adjustCanvasSize.bind(this), DEBOUNCE_DELAY);
  }

  /**
   * 初始化画布
   */
  public init(
    canvasEl: HTMLCanvasElement,
    fabricOptions: FabricCanvasOptions = {},
    fusionOptions: FabricFusionOptions = {},
    container: HTMLElement,
  ): void {
    if (!canvasEl || !container) {
      throw new Error('Canvas element and container are required.');
    }

    this.container = container;
    // console.log(, 999999);
    this.canvas = new fabric.Canvas(canvasEl, {
      ...fabricOptions,
    });

    /** v7 推荐方式设置全局配置 */
    config.textureSize = 8192;

    /** 图层管理器 */
    this.layerManager = new FabricLayerManager(this.canvas);

    /** 默认画布事件 */
    if (fusionOptions.enableDefaultListeners) {
      this.cleanupCanvasEvents = registerCanvasEvents(
        this.canvas,
        fusionOptions.panKey,
        fusionOptions.minZoom,
        fusionOptions.maxZoom,
      );
    }

    /** 自定义事件 */
    if (fusionOptions.customListeners) {
      Object.entries(fusionOptions.customListeners).forEach(([event, handler]) => {
        this.canvas.on(event as any, handler);
      });
    }

    this.initResizeListener();

    /** 缩放时修正固定尺寸对象 */
    this.canvas.on('mouse:wheel', this.adjustFixedObjects.bind(this));
  }

  /**
   * 根据容器尺寸调整画布
   */
  private adjustCanvasSize(): void {
    if (!this.container || !this.canvas) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.canvas.setDimensions({ width, height }, { cssOnly: false });

    this.canvas.requestRenderAll();
  }

  /**
   * 固定屏幕大小对象（不随 zoom 缩放）
   */
  private adjustFixedObjects(): void {
    const zoom = this.canvas.getZoom();

    this.fixedObjects.forEach((obj: any) => {
      if (obj.__initialScaleX && obj.__initialScaleY) {
        obj.set({
          scaleX: obj.__initialScaleX / zoom,
          scaleY: obj.__initialScaleY / zoom,
        });
      }
    });

    this.canvas.requestRenderAll();
  }

  /**
   * ResizeObserver + window resize
   */
  private initResizeListener(): void {
    if (!this.container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.debouncedResize();
    });

    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', this.debouncedResize);
  }

  /**
   * 清理所有监听
   */
  public clearListeners(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    window.removeEventListener('resize', this.debouncedResize);

    this.cleanupCanvasEvents?.();
    this.cleanupCanvasEvents = undefined;
  }

  /**
   * 销毁画布
   */
  public async dispose(): Promise<void> {
    this.clearListeners();
    await this.canvas?.dispose();
  }

  /**
   * 防抖工具
   */
  private debounce<T extends () => void>(fn: T, delay: number): T {
    let timer: number | null = null;

    return function (this: any) {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => fn.call(this), delay);
    } as T;
  }

  /**
   * 添加对象
   */
  public add(objects: FabricObject[], isFixed = false): void {
    objects.forEach((obj: any) => {
      if (isFixed) {
        this.fixedObjects.add(obj);
        obj.__initialScaleX = obj.scaleX ?? 1;
        obj.__initialScaleY = obj.scaleY ?? 1;
      }
      this.canvas.add(obj);
    });
  }

  /**
   * 清空画布
   */
  public clear(): void {
    this.canvas.clear();
    this.fixedObjects.clear();
  }
}
