import { StaticCanvas, FabricObject, Group } from 'fabric';
import { FabricObjectWithLayer } from './type';

/**
 * Fabric 图层管理器
 */
export class FabricLayerManager {
  private canvas: StaticCanvas;

  constructor(canvas: StaticCanvas) {
    this.canvas = canvas;
  }

  /**
   * 设置单个对象所属图层
   * @param object fabric 对象
   * @param layer 图层名
   */
  public setLayer(object: FabricObject, layer: string) {
    if (object) {
      (object as FabricObjectWithLayer).layer = layer;
    }
  }

  /**
   * 批量设置对象所属图层
   * @param objects 对象数组
   * @param layer 图层名
   */
  public setObjectsToLayer(objects: FabricObject[], layer: string) {
    objects.forEach((obj) => this.setLayer(obj, layer));
  }

  /**
   * 获取指定图层的所有对象
   * @param layer 图层名
   */
  public getObjectsByLayer(layer: string): FabricObject[] {
    return this.canvas.getObjects().filter((obj) => (obj as FabricObjectWithLayer).layer === layer);
  }

  /**
   * 判断图层是否存在
   * @param layer 图层名
   */
  public hasLayer(layer: string): boolean {
    return this.getObjectsByLayer(layer).length > 0;
  }

  /**
   * 移除指定图层的所有对象
   * @param layer 图层名
   */
  public removeLayer(layer: string) {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可移除`);
      return;
    }
    objects.forEach((obj) => this.canvas.remove(obj));
    this.canvas.requestRenderAll();
  }

  /**
   * 批量移除多个图层
   * @param layers 图层名数组
   */
  public removeLayers(layers: string[]) {
    layers.forEach((layer) => this.removeLayer(layer));
  }

  /**
   * 将对象添加到指定图层
   * @param objects 对象数组
   * @param layerName 图层名
   */
  public addToLayer(objects: FabricObjectWithLayer[], layerName: string) {
    if (!objects || objects.length === 0) return;

    objects.forEach((obj) => {
      obj.layer = layerName;
      this.canvas.add(obj);
    });
    this.canvas.requestRenderAll();
  }

  /**
   * 隐藏指定图层
   * @param layer 图层名
   */
  public hideLayer(layer: string) {
    this.toggleLayerVisibility(layer, false);
  }

  /**
   * 显示指定图层
   * @param layer 图层名
   */
  public showLayer(layer: string) {
    this.toggleLayerVisibility(layer, true);
  }

  /**
   * 批量隐藏多个图层
   * @param layers 图层名数组
   */
  public hideLayers(layers: string[]) {
    layers.forEach((layer) => this.hideLayer(layer));
  }

  /**
   * 批量显示多个图层
   * @param layers 图层名数组
   */
  public showLayers(layers: string[]) {
    layers.forEach((layer) => this.showLayer(layer));
  }

  /**
   * 将图层对象提升到最上层
   * @param layer 图层名
   */
  public bringLayerToFront(layer: string) {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可提升`);
      return;
    }
    objects.forEach((obj) => this.canvas.bringObjectToFront(obj));
    this.canvas.requestRenderAll();
  }

  /**
   * 将图层对象发送到最下层
   * @param layer 图层名
   */
  public sendLayerToBack(layer: string) {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可发送到底层`);
      return;
    }
    objects.forEach((obj) => this.canvas.sendObjectToBack(obj));
    this.canvas.requestRenderAll();
  }

  /**
   * 将图层对象移动到指定索引
   * @param layer 图层名
   * @param startIndex 起始索引位置
   */
  public moveLayerToIndex(layer: string, startIndex: number) {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可移动`);
      return;
    }
    objects.forEach((obj, i) => this.canvas.moveObjectTo(obj, startIndex + i));
    this.canvas.requestRenderAll();
  }

  /**
   * 将图层对象合并成一个组（fabric.Group）
   * @param layer 图层名
   */
  public groupLayer(layer: string): Group | null {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可组合`);
      return null;
    }

    const group = new Group(objects);
    // 将所有对象移除后再添加 group
    objects.forEach((obj) => this.canvas.remove(obj));
    this.canvas.add(group);
    this.canvas.requestRenderAll();
    return group;
  }

  /**
   * 内部方法：切换图层可见性
   * @param layer 图层名
   * @param visible 是否可见
   */
  private toggleLayerVisibility(layer: string, visible: boolean) {
    const objects = this.getObjectsByLayer(layer);
    if (objects.length === 0) {
      this.log(`图层 ${layer} 无对象可切换可见性`);
      return;
    }
    objects.forEach((obj) => obj.set('visible', visible));
    this.canvas.requestRenderAll();
  }

  /**
   * 获取当前画布中所有图层名称（去重）
   * @param opts.sort 排序方式：'zIndex'（默认，按首个对象的堆叠顺序）、'alpha'（字母序）、'none'
   * @param opts.includeHidden 是否包含不可见对象所在图层，默认 true
   */
  public getAllLayerNames(
    opts: { sort?: 'zIndex' | 'alpha' | 'none'; includeHidden?: boolean } = {},
  ): string[] {
    const { sort = 'zIndex', includeHidden = true } = opts;

    const stack = this.canvas.getObjects();
    // 记录每个图层在画布堆叠中的“首个出现索引”，用于稳定排序
    const firstIndexByLayer = new Map<string, number>();

    stack.forEach((obj, idx) => {
      const layer = (obj as FabricObjectWithLayer).layer;
      if (!layer) return;
      if (!includeHidden && obj.visible === false) return;
      if (!firstIndexByLayer.has(layer)) {
        firstIndexByLayer.set(layer, idx);
      }
    });

    const layers = Array.from(firstIndexByLayer.keys());

    if (sort === 'alpha') {
      layers.sort((a, b) => a.localeCompare(b));
    } else if (sort === 'zIndex') {
      layers.sort((a, b) => firstIndexByLayer.get(a)! - firstIndexByLayer.get(b)!);
    }
    // sort === 'none' 时保留插入顺序（即首次出现顺序）
    return layers;
  }

  /**
   * 内部方法：日志输出
   * @param message 输出信息
   */
  private log(message: string) {
    // if (process.env.NODE_ENV === 'development') {
    //   console.warn(`[FabricLayerManager] ${message}`);
    // }
    console.warn(`[FabricLayerManager] ${message}`);
    // 未来可以对接企业日志系统，如 Sentry / 自研监控
  }
}
