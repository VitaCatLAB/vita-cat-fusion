export interface Point {
  x: number;
  y: number;
}
interface Arc {
  type: IGraphType.ARC;
  borderType: IBorderType;
  x: number;
  y: number;
  r: number;
  a1: number;
  a2: number;
  deltaTheta: number;
  startPoint: Point;
  endPoint: Point;
}
interface Line {
  type: IGraphType.LINE;
  borderType: IBorderType;

  p1: Point;
  p2: Point;
}

export enum IBorderType {
  BORDER = 'BORDER',
  FLOOR = 'FLOOR',
  NO = 'NO',
}
export interface IPoint extends Point {
  origin?: Point;
}
export interface ILine extends Line {
  origin?: Line;
}
export interface IArc extends Arc {
  origin?: Arc;
}

export enum IGraphType {
  POINT = 'POINT',
  LINE = 'LINE',
  ARC = 'ARC',
  GROUP = 'GROUP',
  CIRCLE = 'CIRCLE',
  TEXT = 'TEXT',
  POLYGON = 'POLYGON',
}
///示例代码内容↓

export enum OutlineFrom {
  Template,
  Outline,
}

interface Dict {
  dictType: string;
  label: string;
  status: number;
  value: string;
}

export interface StoneDict {
  blast_stone_level: Dict[];
  blast_stone_type: Dict[];
}

export interface Face {
  createTime: string;
  updateTime: string;
  creator: string;
  updater: string;
  deleted: boolean;
  tenantId: number;
  id: number;
  name: string;
  prefix: string;
  startMileage: number;
  endMileage: number;
  description: string;
  deptId: number;
}

export interface DeptFace {
  deptId: number;
  deptName: string;
  faceList: Face[];
}

export interface CycleItem {
  createTime: number;
  updateTime: number;
  creator: string;
  updater: string;
  deleted: boolean;
  tenantId: number;
  id: number;
  name: string;
  footage: number;
  outlineFrom: number;
  outlineId: number;
  outlineGraphList?: any[] | null; // 假设这是一个数组或null，具体类型根据实际需要调整
  outlineParam?: any | null; // 假设这是一个任意对象或null，具体类型根据实际需要调整
  stoneLevel: number;
  stoneType: number;
  stoneStrength: number;
  planId: number;
  planImage: string;
  planParam?: any | null; // 假设这是一个任意对象或null，具体类型根据实际需要调整
  faceId: number;
  deptId: number;
  // prefix: string;
  creatorName: string;
  creatorAvatar: string;
}

interface Param {
  name: string;
  key: string;
  type: 'number' | 'angle' | 'float';
  value: string;
  desc: string;
}

interface Info {
  name: string;
  key: string;
  type: any;
  value: string;
  desc: string;
}
export interface Outline {
  createTime: number;
  updateTime: number;
  creator: string;
  updater: string;
  deleted: boolean;
  id: number;
  name: string;
  type: number;
  param: Param[];
  image: string;
  graphList: any[];
  info: Info[];
  sort: number;
}

export interface PartitionBorder {
  p1: any;
  p2: any;
  type: any;
  origin: any;
  borderType: string;
}

export interface Partition {
  code: string;
  createTime: number;
  creator: string;
  deleted: false;
  deptId: number;
  graphList: any[];
  id: number;
  layoutParam: layoutParam;
  name: string;
  planId: number;
  position: number;
  tenantId: number;
  updateTime: number;
  updater: string;
}

export interface Plan {
  circleId: number;
  createTime: number;
  creator: number;
  deleted: boolean;
  deptId: number;
  id: number;
  layoutParam: layoutParam;
  name: string;
  graphList: any[];
  info: any[];
  partitionDoList: any[];
  outlineId: number;
  outlineFrom: OutlineFrom;
  partitionParam: {
    floorData: number[];
    width: number;
  };
  status: number;
  stoneLevel: number;
  tenantId: number;

  updateTime: number;
  updater: number;
  ordinaryExplosiveId: number;
  borderExplosiveId: number;
  xoffset: number;
  yoffset: number;
  curveId: number;
  stakeNum: string;
  creatorName: string;
  creatorAvatar: string;
}

export interface layoutParam {
  aidHoleFactor: number;
  borderHoleFactor: number;
  borderHoleOffset: number;
  borderPadding: number;
  cutHoleOffset: number;
  cutType: number;
  cutUltraDepth: number;
  depth: number;
  sequenceDelayDuration: number;
  borderMinimumMass: 2;
  minimumMass: 1;
  stoneLevel: 3;
  holeDiameter: number;
}
export interface Hole {
  angle: number;
  d: number;
  expMass: number;
  id: number;
  l: number;
  name: string;
  partCode: string;
  seq: number;
  subType: number;
  slopeAngle: number;
  type: number;
  x: number;
  y: number;
  innerX?: number;
  innerY?: number;
  origin: any;
  planId?: number;
}

export interface HoleSeqItem {
  seq: number;
  seqIndex: number;
  holeList: Hole[];
}

export interface SequenceParam {
  updateTime: number;
  createTime: number;
  creator: number;
  updater: number;
  deleted: boolean;
  tenantId: number;
  id: number;
  planId: number;
  sequenceParamList: SequenceParamList[];
}

export interface SequenceParamList {
  seq: number;
  holeIds: number[];
  intervalTime: number;
  delayTime: number;
}

export interface Explosive {
  createTime: string;
  updateTime: string;
  creator: string;
  updater: string;
  deleted: boolean;
  tenantId: number;
  id: number;
  name: string;
  deptId: number;
  capacity: number;
  diameter: number;
  unitMass: number;
  density: number;
  brisance: number;
  type: number;
}

export interface Spec {
  dictType: string;
  id: number;
  label: string;
  value: string;
}

export interface Mass {
  dictType: string;
  id: number;
  label: string;
  value: string;
}

export interface ExplosiveGroup {
  seq: number;
  holeIds: number[];
  expMass: number;
  explosiveCount: number;
}

export interface MinimumMass {
  dictType: string;
  id: number;
  label: string;
  value: string;
}
export interface Section {
  id: number;
  sectionNumber: number;
  massMultiple: number;
  expCount: number;
  orificeDistance: number;
  airDeckLength: number;
  expLength: number;
  offsetLength: number;
  spareLength: number;
}

export interface ExplosiveStructure {
  createTime: string;
  updateTime: string;
  creator: string;
  updater: string;
  deleted: boolean;
  tenantId: number;
  id: number;
  length: number;
  expMass: number;
  expCount: number;
  expLength: number;
  sectionCount: number;
  stemmingLength: number;
  minFraction: number;
  holeIdList: number[]; // Assuming it's an array of numbers
  sectionList: Section[];
  planId: number;
}

export interface CurveItem {
  createTime: string;
  creatorId: number;
  deleted: boolean;
  deptId: number;
  id: number;
  name: string;

  planeCurveParamList: PlaneCurve[];
  planeRdCurveList: VerticalCurve[];
  verticalCurveParamList: PlaneCurve[];
  verticalRdCurveList: VerticalCurve[];

  tenantId: number;
  updateTime: number;
  updater: string;
}
export interface PlaneCurve {
  alpha: number;
  curveLength1: number;
  curveLength2: number;
  pointName: string;
  r: number;
  stakeNum: number;
  strStakeNum: string;
  x: number;
  y: number;
}

export interface VerticalCurve {
  endStackNum: number;
  length: number;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  startStackNum: number;
  type: string;
}

export interface OffsetPoint {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
}
export interface StagesItem {
  charge: number;
  chargePercentage: number;
  holeCount: number;
  length: number;
  lengthPercentage: number;
  sort: number;
}

export interface TeiItem {
  order: number;
  quantity: number;
  type: string;
  unit: string;
}

export interface CostItem {
  name: string;
  order: number;
  quantity: number;
  totals: number;
  type: string;
  unit: string;
  unitPrice: number;
}

export interface StatItem {
  id: number;
  deptId: number;
  faceId: number;
  circleId: number;
  planId: number | null;
  recordId: number;
  depth: number;
  footage: number;
  utilization: number;
  circleName: string;
  utilizationList: any | null;
}

export interface ProjectProgress {
  deptId: number;
  deptName: string;
  footage: number;
  mileage: number;
}
