import { emptyFieldFormatter } from '@/utils';
import { teacherStatus, DefaultSlot, TYPE_SUSPEND } from '@/constants';
const customTableTag = (attrs = {}) => ({
  name: ElTag,
  attrs: {
    type: 'info',
    size: 'small',
    class: 'mr-0.5',
    ...attrs,
  },
});

export function inactiveTeacherTypeRender([value, emptyValue = '']) {
  const label = '分類';
  const { isEmpty } = emptyFieldFormatter(value, emptyValue);

  if (!isEmpty) {
    return {
      label,
      components: [
        {
          ...customTableTag({
            type: value === TYPE_SUSPEND ? 'warning' : 'error',
          }),
          uniqKey: value,
          slots: [
            { name: DefaultSlot, value: teacherStatus.get(value) || value },
          ],
        },
      ],
    };
  }
  return {
    label,
    value: emptyValue,
  };
}

export function inactiveTeacherConfirmRender([value, emptyValue = '']) {
  const label = '承認';
  const { isEmpty } = emptyFieldFormatter(value, emptyValue);

  if (!isEmpty) {
    return {
      label,
      components: [
        {
          ...customTableTag({
            type: value === '承認済' ? 'success' : 'warning',
          }),
          uniqKey: value,
          slots: [{ name: DefaultSlot, value: value }],
        },
      ],
    };
  }
  return {
    label,
    value: emptyValue,
  };
}

export function inactiveStatusRender(
  [value, emptyValue = ''],
  extra = {}
): any {
  const label = '講師ステータス';
  return {
    label,
    uniqKey: value,
    ...(value?.length
      ? {
          components: value.map(({ school_name, status }) => ({
            uniqKey: `${school_name}:${status}`,
            ...customTableTag(),
            slots: [{ name: DefaultSlot, value: `${school_name}:${status}` }],
          })),
        }
      : {
          value: emptyValue,
        }),

    ...extra,
  };
}
