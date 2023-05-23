import { isString } from '@vueuse/core';

import type {
  IFormEntry,
  IOption,
  IConvertSelectSpec,
  IConvertDatesOption,
  IConvertDateParams,
} from './types';

export const convertOptions =
  (component: typeof ElRadio | typeof ElCheckbox) =>
  (options: { label: string; value?: string | number | boolean }[]) =>
    [
      {
        name: 'default',
        components: options.map(({ label, value }) => ({
          name: component,
          attrs: { label: value },
          slots: [{ name: 'default', value: label }],
        })),
      },
    ];

export const createOptionsFetcher =
  (
    fetch?: (keyword?: string) => IOption[] | void | Promise<IOption[] | void>
  ) =>
  async (k: string | FocusEvent) => {
    if (!fetch) {
      return;
    }

    try {
      const keyword = isString(k) ? k : undefined;
      await fetch(keyword);
    } catch (e) {
      console.error(e);
    }
  };

export const convertSelect: (s: IConvertSelectSpec) => IFormEntry = ({
  label,
  prop,
  fetch,
  vif,
  options,
  loading,
  filterable,
  multiple,
  rules,
  change,
  valueConverter,
}) => ({
  label,
  prop,
  vif,
  fetch,
  rules,
  component: {
    name: ElSelectV2,
    attrs: {
      placeholder: '選択',
      remote: Boolean(fetch),
      clearable: true,
      class: 'w-full',
      loading,
      options,
      filterable,
      multiple,
      change,
      onFocus: createOptionsFetcher(fetch),
      'remote-method': createOptionsFetcher(fetch),
    },
  },
  valueConverter: valueConverter ?? Number,
});

export const convertDate = ({
  label,
  prop,
  vif,
  rules,
  disabledDate,
}: IConvertDateParams) => ({
  label,
  prop,
  component: {
    name: ElDatePicker,
    type: 'date',
    placeholder: `選択${label}`,
    'value-format': 'YYYY-MM-DD',
    'disabled-date': disabledDate,
  },
  vif,
  rules,
});

export const convertDates = (
  dates: IConvertDateParams[],
  { vif, rules, requiredFields }: IConvertDatesOption = {}
) => ({
  label: dates.reduce((acc, { label }) => (acc ? acc + '/' : '') + label, ''),
  prop: dates.reduce((acc, { prop }) => (acc ? acc + '-' : '') + prop, ''),
  components: dates
    .map(convertDate)
    .map(({ component, ...o }) => ({ ...component, ...o })),
  vif,
  rules,
  requiredFields,
});

export const convertDateRange = ({
  label,
  prop,
}: {
  label: string;
  prop: string;
}) => ({
  label,
  prop,
  component: {
    name: ElDatePicker,
    type: 'daterange',
    placeholder: '選択',
    'start-placeholder': '選択',
    'end-placeholder': '選択',
    'value-format': 'YYYY-MM-DD',
  },
});
