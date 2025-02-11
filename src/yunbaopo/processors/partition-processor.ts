import { cloneDeep } from 'lodash';
import { IGraphType } from '../graphics/interface';
import { transformArc } from '../graphics/primitives/arc';
import { transformLine } from '../graphics/primitives/line';
import { transformPoint } from '../graphics/primitives/point';

const transformGraphList = (originData: any[]): any => {
  const computedParam = cloneDeep(originData) || [];

  for (let index = 0; index < computedParam.length; index++) {
    const param = computedParam[index];
    switch (param.type) {
      case IGraphType.ARC:
        computedParam[index] = transformArc(param);
        break;
      case IGraphType.LINE:
        computedParam[index] = transformLine(param);
        break;
      case IGraphType.POINT:
        computedParam[index] = transformPoint(param);
        break;
    }
  }

  return computedParam;
};

export const partitionProcessor = (originData: any[]): any => {
  const processedPartitions = cloneDeep(originData) || [];

  for (let index = 0; index < processedPartitions.length; index++) {
    const param = processedPartitions[index];
    processedPartitions[index].graphList = transformGraphList(param.graphList);
  }

  return processedPartitions;
};
