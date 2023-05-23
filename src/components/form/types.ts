import type { Ref } from 'vue';
import type { IComponent } from '@/types';
import type { FormItemRule } from 'element-plus';

export type TFormDataValue =
  | string[]
  | number[]
  | boolean[]
  | string
  | number
  | boolean
  | undefined
  | null;

export type TFormData = Record<string, TFormDataValue>;

export interface IComponentWithType extends IComponent {
  type?: string;
  prop?: string;
  component?: IComponentWithType;
  vif?: () => boolean;
  rules?: FormItemRule | FormItemRule[] | any;
}

export interface IFormEntry {
  label?: string;
  prop: string;
  desc?: string;

  component?: IComponentWithType;
  components?: IComponentWithType[];

  rules?: FormItemRule | FormItemRule[] | any;
  requiredFields?: string[];

  vif?: () => boolean;
  valueConverter?: (a: any) => string | number | boolean | undefined | null;
  fetch?: () => IOption[] | void | Promise<IOption[] | void>;
}

export interface IOption {
  label: string;
  value?: number | string | boolean;
}

export interface IConvertSelectSpec {
  label: string;
  prop: string;
  fetch?: (k?: string) => IOption[] | void | Promise<IOption[] | void>;
  vif?: () => boolean;
  loading?: boolean | Ref<boolean>;
  options?: IOption[] | Ref<IOption[]>;

  multiple?: boolean;
  filterable?: boolean;

  rules?: FormItemRule | FormItemRule[];
  change?: (value: string | number | boolean | undefined | null) => void;

  valueConverter?: (a: any) => string | number | boolean | undefined | null;
}

export interface IConvertDateParams {
  label: string;
  prop: string;
  vif?: () => boolean;
  rules?: FormItemRule | FormItemRule[];
  disabledDate?: (d: Date) => boolean;
}

export interface IConvertDatesOption {
  vif?: () => boolean;
  rules?: FormItemRule | FormItemRule[] | any;
  requiredFields?: string[];
}
