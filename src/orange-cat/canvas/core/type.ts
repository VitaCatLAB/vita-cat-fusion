export interface IFabricObject extends fabric.Object {
  metaData: any;
}
export interface IFabricGroup extends fabric.Group {
  metaData: any;
}
export interface IFabricEvent extends fabric.IEvent {
  target: IFabricObject;
}
