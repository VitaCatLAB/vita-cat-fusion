export interface IFabricObject extends fabric.Object {
  metaData: any;
}
export interface IFabricGroup extends fabric.Group {
  metaData: any;
}
export interface IFabricEvent extends fabric.IEvent {
  target: IFabricObject;
}
export interface FabricObjectWithLayer extends fabric.Object {
  layer?: string;
  tooltip?: string;
  tooltipPosition?: 'TL' | 'TR' | 'BL' | 'BR';
}

import { fabric } from './fabric-render';

/**
 * 扩展 Fabric.Object，使其具备图层属性
 */
export interface FabricObjectWithLayer extends fabric.Object {
  /**
   * 所属图层名称
   */
  layer?: string;
}

/**
 * FabricLayerManager 操作的图层对象基本类型
 */
export type LayerName = string;

/**
 * 统一日志输出级别
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * FabricLayerManager 的配置项（预留扩展）
 */
export interface FabricLayerManagerOptions {
  /**
   * 当前是否启用调试模式
   */
  debug?: boolean;

  /**
   * 日志等级（默认警告）
   */
  logLevel?: LogLevel;
}
