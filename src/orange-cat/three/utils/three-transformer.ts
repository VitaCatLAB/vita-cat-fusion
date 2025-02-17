import * as THREE from 'three';

/**
 * @class ThreeToCartesianTransformer
 * @description 用于在二维坐标系（笛卡尔坐标系）和 Three.js 坐标系之间进行坐标转换。
 *              将二维图形的坐标映射到 Three.js 3D 空间，并支持缩放和偏移设置。
 *              可以根据需要将图形投影到不同的 Z 值平面上。
 *
 * @example
 * // 初始化转换器（场景宽 800，高 600，缩放比 2，X 偏移 +50，Y 偏移 -30，Z 偏移 0）
 * const transformer = new ThreeToCartesianTransformer({
 *   sceneWidth: 800,
 *   sceneHeight: 600,
 *   scaleFactor: 2,
 *   xOffset: 50,
 *   yOffset: -30,
 *   zOffset: 0
 * });
 *
 * // 将 2D 坐标转换为 Three.js 坐标
 * const threeCoordinates = transformer.toThreeCoordinates(100, 50);
 * console.log(threeCoordinates); // 输出 Three.js 的 Vector3 坐标
 *
 * // 将 3D 坐标转换回 2D 坐标
 * const cartesianCoordinates = transformer.toCartesianCoordinates(150, 100);
 * console.log(cartesianCoordinates); // 输出 2D 笛卡尔坐标
 */
export class ThreeToCartesianTransformer {
  private sceneWidth: number; // 场景的宽度
  private sceneHeight: number; // 场景的高度
  private scaleFactor: number; // 缩放比例
  private xOffset: number; // X 偏移量
  private yOffset: number; // Y 偏移量
  private zOffset: number; // Z 偏移量（控制图形在 Z 轴上的深度位置）

  /**
   * @constructor
   * @param {object} config - 配置信息
   * @param {number} config.sceneWidth - 场景宽度（像素）
   * @param {number} config.sceneHeight - 场景高度（像素）
   * @param {number} [config.scaleFactor=1] - 缩放比（默认值 1）
   * @param {number} [config.xOffset=0] - X 方向的偏移量（默认 0）
   * @param {number} [config.yOffset=0] - Y 方向的偏移量（默认 0）
   * @param {number} [config.zOffset=0] - Z 方向的偏移量（默认 0）
   */
  constructor(config: {
    sceneWidth: number;
    sceneHeight: number;
    scaleFactor?: number;
    xOffset?: number;
    yOffset?: number;
    zOffset?: number;
  }) {
    this.sceneWidth = config.sceneWidth;
    this.sceneHeight = config.sceneHeight;
    this.scaleFactor = config.scaleFactor ?? 1; // 默认缩放比 1
    this.xOffset = config.xOffset ?? 0; // 默认 X 方向无偏移
    this.yOffset = config.yOffset ?? 0; // 默认 Y 方向无偏移
    this.zOffset = config.zOffset ?? 0; // 默认 Z 方向无偏移
  }

  /**
   * @method toThreeCoordinates
   * @description 将 2D 笛卡尔坐标转换为 Three.js 3D 坐标（包含 X、Y 和 Z）
   * @param {number} x - 笛卡尔坐标系中的 X 坐标
   * @param {number} y - 笛卡尔坐标系中的 Y 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @param {number} [z=0] - Z 轴坐标，默认值为 0
   * @returns {THREE.Vector3} 转换后的 Three.js 3D 坐标
   */
  toThreeCoordinates(x: number, y: number, scale: boolean = true, z: number = 0): THREE.Vector3 {
    // 先转换 X 和 Y 坐标
    const threeX = this.toThreeX(x, scale);
    const threeY = this.toThreeY(y, scale);
    // 返回转换后的 3D 坐标，并添加 Z 偏移
    return new THREE.Vector3(threeX, threeY, z + this.zOffset);
  }

  /**
   * @method toThreeX
   * @description 将笛卡尔坐标系中的 X 转换为 Three.js 中的 X 坐标
   * @param {number} x - 笛卡尔坐标系中的 X 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} Three.js 坐标系中的 X 坐标
   */
  private toThreeX(x: number, scale: boolean): number {
    return (scale ? x * this.scaleFactor : x) + this.xOffset + this.sceneWidth / 2;
  }

  /**
   * @method toThreeY
   * @description 将笛卡尔坐标系中的 Y 转换为 Three.js 中的 Y 坐标
   * @param {number} y - 笛卡尔坐标系中的 Y 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} Three.js 坐标系中的 Y 坐标
   */
  private toThreeY(y: number, scale: boolean): number {
    return this.sceneHeight / 2 - (scale ? y * this.scaleFactor : y) - this.yOffset;
  }

  /**
   * @method toCartesianCoordinates
   * @description 将 Three.js 3D 坐标转换回 2D 笛卡尔坐标
   * @param {number} x - Three.js 坐标系中的 X 坐标
   * @param {number} y - Three.js 坐标系中的 Y 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {object} 包含转换后的 2D 坐标对象 {x, y}
   */
  toCartesianCoordinates(x: number, y: number, scale: boolean = true): { x: number; y: number } {
    const cartesianX = this.toCartesianX(x, scale);
    const cartesianY = this.toCartesianY(y, scale);
    return { x: cartesianX, y: cartesianY };
  }

  /**
   * @method toCartesianX
   * @description 将 Three.js 坐标系中的 X 转换回笛卡尔坐标系中的 X
   * @param {number} x - Three.js 坐标系中的 X 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} 笛卡尔坐标系中的 X
   */
  private toCartesianX(x: number, scale: boolean): number {
    return (x - this.sceneWidth / 2 - this.xOffset) / (scale ? this.scaleFactor : 1);
  }

  /**
   * @method toCartesianY
   * @description 将 Three.js 坐标系中的 Y 转换回笛卡尔坐标系中的 Y
   * @param {number} y - Three.js 坐标系中的 Y 坐标
   * @param {boolean} [scale=true] - 是否适配缩放比（默认适配）
   * @returns {number} 笛卡尔坐标系中的 Y
   */
  private toCartesianY(y: number, scale: boolean): number {
    return (this.sceneHeight / 2 - y - this.yOffset) / (scale ? this.scaleFactor : 1);
  }
}
