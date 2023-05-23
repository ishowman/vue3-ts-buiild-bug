export type RenderInput<T> = [T, string] | [T];
export interface IComponent {
  name: InstanceType<any>;
  attrs?: Record<string, any>;
  slots?: ISlot[];
  uniqKey?: string | number;
}
export interface ISlot {
  name: string;
  value?: string | number; // 当不存在 components 字段，会直接使用 value 作为展示内容
  components?: IComponent[]; // 配置插槽内的子组件
}

export * from './date';

export enum NumbericBoolean {
  false = 0,
  true = 1,
}
