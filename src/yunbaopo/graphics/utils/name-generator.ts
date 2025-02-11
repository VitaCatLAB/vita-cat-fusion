import { v4 as uuidv4 } from 'uuid';

// 统一的基础前缀
const BASE = 'BASE';

// 定义 `NAME` 枚举，并使用 `Object.freeze()` 确保不可修改
const NAME = Object.freeze({
  BASE: 'BASE',
  GRID_LINE: 'GRID_LINE',
  DIRECT_LINE: 'DIRECT_LINE',
  GROUP: 'GROUP',
  HOLE: 'HOLE',
  HOLE_LINE: 'HOLE_LINE',
  PARTITION: 'PARTITION',
  OUTLINE: 'OUTLINE',
  TEXT: 'TEXT',
  STRUCTURE: 'STRUCTURE',
  DOT: '_', // 扩展符号
});

// **通用的前缀生成函数**
const createPrefix = (key: string) => `${NAME.BASE}_${key}#`;

// 统一定义 `PREFIX`（前缀）
export const PREFIX = Object.freeze({
  OUTLINE: createPrefix(NAME.OUTLINE),
  PARTITION: createPrefix(NAME.PARTITION),
  HOLE: createPrefix(NAME.HOLE),
  HOLE_LINE: createPrefix(NAME.HOLE_LINE),
  TEXT: createPrefix(NAME.TEXT),
  GRID_LINE: createPrefix(NAME.GRID_LINE),
  DIRECT_LINE: createPrefix(NAME.DIRECT_LINE),
  STRUCTURE: createPrefix(NAME.STRUCTURE),
});

// **通用的名称生成函数**
const genName = (prefix: string, name?: string) => `${prefix}${name ?? uuidv4()}`;

// **封装具体的名称生成方法**
export const genTextName = (name?: string) => genName(PREFIX.TEXT, name);
export const genOutlineName = (name?: string) => genName(PREFIX.OUTLINE, name);
export const genHoleName = (name?: string) => genName(PREFIX.HOLE, name);
export const genStructureName = (name?: string) => genName(PREFIX.STRUCTURE, name);
export const genPartitionName = (name?: string) => genName(PREFIX.PARTITION, name);
export const genHoleLineName = (name?: string) => genName(PREFIX.HOLE_LINE, name);
export const genGridLineName = (name?: string) => genName(PREFIX.GRID_LINE, name);
export const genDirectLineName = (name?: string) => genName(PREFIX.DIRECT_LINE, name);

// export const StraightOutlineName = genPartitionName('zhikong');
