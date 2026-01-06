/**
 * @class CoordinateTransformer
 * @description 用于在业务坐标系（以画布中心为原点）和 Fabric.js 画布坐标系（以左上角为原点）之间进行坐标转换。
 *              支持 X 坐标、Y 坐标、长度的双向转换，并可配置缩放比例和偏移量。
 *
 * @example
 * // 初始化转换器（画布宽 800，高 600，缩放比 2，X 偏移 +50，Y 偏移 -30）
 * const transformer = new CoordinateTransformer({
 *   canvasWidth: 800,
 *   canvasHeight: 600,
 *   scaleFactor: 2,
 *   xOffset: 50,
 *   yOffset: -30,
 * });
 *
 * // 业务坐标转换为 Fabric.js 画布坐标
 * console.log(transformer.toCanvasX(100));  // 计算转换后的 X 坐标
 * console.log(transformer.toCanvasY(50));   // 计算转换后的 Y 坐标
 *
 * // Fabric.js 画布坐标转换回业务坐标
 * console.log(transformer.toBusinessX(500)); // 计算转换回业务坐标的 X 坐标
 * console.log(transformer.toBusinessY(300)); // 计算转换回业务坐标的 Y 坐标
 */
export class CoordinateTransformer {
  private canvasWidth: number;
  private canvasHeight: number;
  private scaleFactor: number;
  private xOffset: number;
  private yOffset: number;

  /**
   * @constructor
   * @param {object} config - 配置信息
   * @param {number} config.canvasWidth - 画布宽度（像素）
   * @param {number} config.canvasHeight - 画布高度（像素）
   * @param {number} [config.scaleFactor=1] - 坐标缩放比（默认值 1）
   * @param {number} [config.xOffset=0] - X 方向的偏移量（默认 0，不参与缩放）
   * @param {number} [config.yOffset=0] - Y 方向的偏移量（默认 0，不参与缩放）
   */
  constructor(config: {
    canvasWidth: number;
    canvasHeight: number;
    scaleFactor?: number;
    xOffset?: number;
    yOffset?: number;
  }) {
    this.canvasWidth = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;
    this.scaleFactor = config.scaleFactor ?? 1; // 默认缩放比 1
    this.xOffset = config.xOffset ?? 0; // 默认 X 方向无偏移
    this.yOffset = config.yOffset ?? 0; // 默认 Y 方向无偏移
  }

  /**
   * @method toCanvasX
   * @description 业务 X 坐标转换为 Fabric.js 画布 X 坐标
   * @param {number} x - 业务坐标系中的 X 值
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} Fabric.js 画布坐标系中的 X 值
   */
  toCanvasX(x: number, scale: boolean = true): number {
    return (scale ? x * this.scaleFactor : x) + this.xOffset + this.canvasWidth / 2;
  }

  /**
   * @method toBusinessX
   * @description Fabric.js 画布 X 坐标转换为 业务 X 坐标
   * @param {number} x - 画布坐标系中的 X 值
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} 业务坐标系中的 X 值
   */
  toBusinessX(x: number, scale: boolean = true): number {
    return (x - this.canvasWidth / 2 - this.xOffset) / (scale ? this.scaleFactor : 1);
  }

  /**
   * @method toCanvasY
   * @description 业务 Y 坐标转换为 Fabric.js 画布 Y 坐标
   * @param {number} y - 业务坐标系中的 Y 值
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} Fabric.js 画布坐标系中的 Y 值
   */
  toCanvasY(y: number, scale: boolean = true): number {
    return this.canvasHeight / 2 - (scale ? y * this.scaleFactor : y) - this.yOffset;
  }

  /**
   * @method toBusinessY
   * @description Fabric.js 画布 Y 坐标转换为 业务 Y 坐标
   * @param {number} y - 画布坐标系中的 Y 值
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} 业务坐标系中的 Y 值
   */
  toBusinessY(y: number, scale: boolean = true): number {
    return (this.canvasHeight / 2 - y - this.yOffset) / (scale ? this.scaleFactor : 1);
  }

  /**
   * @method toCanvasLength
   * @description 业务坐标系中的长度转换为 Fabric.js 画布中的长度
   * @param {number} length - 业务坐标系中的长度
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} Fabric.js 画布坐标系中的长度
   */
  toCanvasLength(length: number, scale: boolean = true): number {
    return scale ? length * this.scaleFactor : length;
  }

  /**
   * @method toBusinessLength
   * @description Fabric.js 画布中的长度转换为 业务坐标系中的长度
   * @param {number} length - 画布坐标系中的长度
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} 业务坐标系中的长度
   */
  toBusinessLength(length: number, scale: boolean = true): number {
    return scale ? length / this.scaleFactor : length;
  }
}
