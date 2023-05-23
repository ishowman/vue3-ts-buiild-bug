import {
  ZenginSettingTranslation,
  LeaveFieldTranslation,
  DefaultSlot,
} from '@/constants';
import { isObject } from '@vueuse/core';
import type { IComponent, RenderInput } from '@/types';

export const tableTag = {
  name: ElTag,
  attrs: {
    type: 'info',
    size: 'small',
    class: 'mr-0.5',
  },
};

// interface IRender {
//   value?: string,
//   components?:
// }

// type renderConfig =
//   | {
//       value: string;
//     }
//   | {
//       components: IComponent[];
//     };

export function studentGroupsRender(
  [student_groups, emptyValue = ''],
  extra: Record<string, any> = {}
): any {
  // id: 1020
  if (student_groups?.length) {
    const components: IComponent[] = student_groups.map((item) => ({
      ...tableTag,
      slots: [
        {
          name: DefaultSlot,
          value: item.group_name,
        },
      ],
    }));
    return {
      components,
      ...extra,
    };
  }

  return {
    ...extra,
    value: emptyValue,
  };
}

interface IZenginSetting {
  status_code: number;
  branch_number: number;
  created_at: string;
  updated_at: string;
  veritrans_status: string;
}

export function zenginSettingRender(
  [zengin_setting, emptyValue = '']: RenderInput<IZenginSetting>,
  extra: Record<string, any> = {}
): any {
  // 299516
  const label = '口座';

  if (zengin_setting || isObject(zengin_setting)) {
    const zenginSetting = Object.entries(zengin_setting);
    if (zenginSetting.length && zenginSetting.some(([_, val]) => val)) {
      const components: IComponent[] = [];
      zenginSetting.map(([key, item]) => {
        components.push({
          ...tableTag,
          slots: [
            {
              name: DefaultSlot,
              value: `${ZenginSettingTranslation[key]}: ${
                [null, undefined].includes(item) ? '' : item
              }`,
            },
          ],
        });
      });

      return {
        label,
        components,
        ...extra,
      };
    }
  }
  return {
    ...extra,
    value: emptyValue,
    label,
  };
}
interface ILeave {
  leave_status: string;
  quit_reason: string;
  schedule_date: string;
}

export function leaveRender(
  [leave, emptyValue = '']: RenderInput<ILeave>,
  extra = {}
): any {
  // id: 3

  if (leave || isObject(leave)) {
    const leaveArray = Object.entries(leave);
    if (leaveArray.length && leaveArray.some(([_, val]) => val)) {
      return {
        label: 'アカウント停止',
        ...extra,
        components: leaveArray.map(([key, value]) => {
          return {
            ...tableTag,
            slots: [
              {
                name: DefaultSlot,
                value: `${LeaveFieldTranslation[key]}: ${
                  [null, undefined].includes(value) ? '' : value
                }`,
              },
            ],
          };
        }),
      };
    }
  }

  return {
    value: emptyValue,
    label: 'アカウント停止',
    ...extra,
  };
}

export function telsRender([tels, emptyValue = ''], extra = {}): any {
  return {
    label: '他の電話番号',
    value:
      (tels?.length &&
        tels.map(({ name, tel }) => `${name}:${tel}`).join(' ')) ||
      emptyValue,
    ...extra,
  };
}

export function siblingsRender([siblings, emptyValue = ''], extra = {}): any {
  // 12
  return {
    label: '兄弟姉妹',
    ...(siblings?.length
      ? {
          components: siblings.map((item) => ({
            ...tableTag,
            slots: [{ name: DefaultSlot, value: item.name }],
          })),
        }
      : {
          value: emptyValue,
        }),

    ...extra,
  };
}

export function isActiveAppRender(
  [is_active_app, emptyValue = ''],
  extra = {}
): any {
  return {
    label: 'アプリ',
    value: is_active_app ? '登録済み' : emptyValue,
    ...extra,
  };
}

export function semesterTypeRender(
  [semesterType, emptyValue = ''],
  extra = {}
): any {
  return {
    label: '学期制',
    value: semesterType || emptyValue,
    ...extra,
  };
}

export function periodRender([period, emptyValue = '']) {
  // zhonghui.qiu	id: 529795
  if (!period) {
    return {
      label: '在籍期間',
      value: emptyValue,
    };
  }
  const { days, months } = period;

  return {
    label: '在籍期間',
    value: `${days}日間${months ? `(${months}ヶ月)` : emptyValue}`,
  };
}
