import { DefaultSlot } from '@/constants';
import { emptyFieldFormatter } from '@/utils';
import CStatusDot from '@/components/CStatusDot.vue';

const customTableTag = (attrs = {}) => ({
  name: ElTag,
  attrs: {
    type: 'info',
    size: 'small',
    class: 'mr-0.5',
    ...attrs,
  },
});

export function statusRender([value, emptyValue = '']) {
  const label = 'ステータス';
  const { isEmpty } = emptyFieldFormatter(value, emptyValue);
  const typeMap = {
    更新しました: 'success',
    更新されません: 'warning',
    請求番号が無効です: 'danger',
  };

  if (!isEmpty) {
    return {
      label,
      components: [
        {
          ...customTableTag({
            type: typeMap[value],
          }),
          uniqKey: value,
          slots: [{ name: DefaultSlot, value }],
        },
      ],
    };
  }
  return {
    label,
    value: emptyValue,
  };
}

export function payStatusRender([value, emptyValue = '']) {
  const label = '支払方法';
  const { isEmpty } = emptyFieldFormatter(value, emptyValue);
  const payStatus = {
    未納: 'danger',
    既納: 'success',
  };

  if (!isEmpty) {
    return {
      label,
      components: [
        {
          name: CStatusDot,
          attrs: {
            status: payStatus[value],
          },
          uniqKey: value,
          slots: [{ name: DefaultSlot, value }],
        },
      ],
    };
  }
  return {
    label,
    value: emptyValue,
  };
}
