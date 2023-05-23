import {
  GradesTransilation,
  SexMap,
  teacherStatus,
  DefaultSlot,
} from '@/constants';
import type { IComponent } from '@/types';
import { emptyFieldFormatter } from '@/utils';
import { tableTag } from '@/views/students/list/studentFieldRender';

const customTableTag = (attrs) => ({
  name: ElTag,
  attrs: {
    type: 'info',
    size: 'small',
    class: 'mr-0.5',
    ...attrs,
  },
});

export function schoolNameRender(
  [school_name, emptyValue = ''],
  extra: Record<string, any> = {}
): any {
  const schoolName = Object.entries(school_name);
  if (schoolName.length && schoolName.some(([_, val]) => val)) {
    const components: IComponent[] = [];
    if (school_name?.own_schools?.length) {
      for (const school of school_name.own_schools) {
        components.push({
          uniqKey: school.id,
          ...customTableTag({
            type: 'warning',
          }),
          slots: [
            {
              name: DefaultSlot,
              value: `${school.name}: オーナー`,
            },
          ],
        });
      }
    }
    if (school_name?.admin_schools?.length) {
      for (const school of school_name.admin_schools) {
        components.push({
          uniqKey: school.id,
          ...customTableTag({
            type: 'success',
          }),
          slots: [
            {
              name: DefaultSlot,
              value: `${school.name}: 管理者`,
            },
          ],
        });
      }
    }

    if (school_name?.normal_schools?.length) {
      for (const school of school_name.normal_schools) {
        components.push({
          uniqKey: school.id,
          ...tableTag,
          slots: [
            {
              name: DefaultSlot,
              value: `${school.name}: 一般講師`,
            },
          ],
        });
      }
    }

    return {
      label: '教室名',
      components,
      ...extra,
    };
  }

  return {
    ...extra,
    value: emptyValue,
    label: '教室名',
  };
}

export function statusRender([status, emptyValue = ''], extra = {}): any {
  const label = '講師ステータス';
  if (status?.length) {
    const components = status.map(({ name, log_type }) => ({
      uniqKey: `${log_type}-${name}`,
      ...tableTag,
      slots: [
        {
          name: DefaultSlot,
          value: `${name}:${teacherStatus[log_type] || log_type}`,
        },
      ],
    }));
    return {
      label,
      components,
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function gradeRender([grade, emptyValue = '']) {
  const label = '学年';
  const { isEmpty } = emptyFieldFormatter(grade, emptyValue);

  if (!isEmpty) {
    return {
      label,
      value: GradesTransilation[grade] || grade,
    };
  }
  return {
    label,
    value: emptyValue,
  };
}

export function sexRender([sex, emptyValue = '']) {
  const label = '性別';
  const { isEmpty } = emptyFieldFormatter(sex, emptyValue);

  if (!isEmpty) {
    return {
      label,
      value: SexMap.get(sex) || sex,
    };
  }
  return {
    label,
    value: emptyValue,
  };
}

export function emergencyContactTelsRender(
  [emergency_contact_tels, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '緊急連絡先';
  if (emergency_contact_tels?.length) {
    return {
      label,
      value: emergency_contact_tels
        .map(
          ({ name, emergency_contact_tel }) =>
            `${name}:${emergency_contact_tel}`
        )
        .join(joinSymbol),
      ...extra,
    };
  }
  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function emergencyContactNamesRender(
  [emergency_contact_names, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '緊急連絡先名';
  if (emergency_contact_names?.length) {
    return {
      label,
      value: emergency_contact_names
        .map(
          ({ name, emergency_contact_name }) =>
            `${name}:${emergency_contact_name}`
        )
        .join(joinSymbol),
      ...extra,
    };
  }
  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function educationNamesRender(
  [education_names, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '学校';
  if (education_names?.length) {
    return {
      label,
      value: education_names
        .map(({ name, education_name }) => `${name}:${education_name}`)
        .join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function departmentNamesRender(
  [department_names, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '学部';

  if (department_names?.length) {
    return {
      label,
      value: department_names
        .map(({ name, department_name }) => `${name}:${department_name}`)
        .join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function introducersRender(
  [introducers, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '紹介者';

  if (introducers?.length) {
    return {
      label,
      value: introducers
        .map(({ name, introducer }) => `${name}:${introducer}`)
        .join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function startDaysRender(
  [start_days, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '授業開始日';

  if (start_days?.length) {
    return {
      label,
      value: start_days
        .map(({ name, start_day }) => `${name}:${start_day}`)
        .join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function memosRender(
  [memos, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = 'メモ';

  if (memos?.length) {
    return {
      label,
      value: memos.map(({ name, note }) => `${name}:${note}`).join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function periodRender(
  [period, emptyValue = '', joinSymbol = ' '],
  extra: Record<string, any> = {}
) {
  const label = '在籍期間';

  if (period?.length) {
    return {
      label,
      value: period
        .map(
          ({ days, months, name }) =>
            `${name}:${days}日間${months ? '(' + months + 'ヶ月)' : emptyValue}`
        )
        .join(joinSymbol),
      ...extra,
    };
  }

  return {
    label,
    value: emptyValue,
    ...extra,
  };
}

export function isActiveAppRender(
  [is_active_app, emptyValue = ''],
  extra = {}
): any {
  return {
    label: 'アプリログイン    ',
    value: is_active_app ? 'ログイン済' : emptyValue,
    ...extra,
  };
}

export function isBrowserLoggedInRender(
  [is_browser_logged_in, emptyValue = ''],
  extra = {}
): any {
  return {
    label: 'ブラウザログイン',
    value: is_browser_logged_in ? 'ログイン済' : emptyValue,
    ...extra,
  };
}

export function attachmentsRender([attachments, emptyValue = ''], extra = {}) {
  const label = '添付ファイル';
  function getFileItem(attachment, showSplit) {
    const result: IComponent[] = [];
    attachment?.data?.length &&
      attachment.data.forEach((file, i) => {
        result.push({
          uniqKey: `${file.id}-${file.file_url}`,
          name: 'a',
          attrs: {
            id: `file-${file.id}`,
            href: file.file_url,
            download: true,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'file',
          },
          slots: [
            {
              name: 'default',
              value: file.file_name,
            },
          ],
        });
        if (i + 1 < attachment.data.length) {
          result.push({
            uniqKey: `${file.id}-${i}`,
            name: 'span',
            slots: [
              {
                name: 'default',
                value: '、',
              },
            ],
          });
        } else {
          showSplit &&
            result.push({
              uniqKey: `${file.id}-${i}`,
              name: 'span',
              slots: [
                {
                  name: 'default',
                  value: '、',
                },
              ],
            });
        }
      });

    return result;
  }

  if (attachments?.length) {
    const components: IComponent[] = [];

    attachments.forEach((attachment, index) => {
      components.push({
        uniqKey: `${attachment.id}-${index}`,

        name: 'span',
        slots: [
          {
            name: 'default',
            components: [
              {
                name: 'span',
                slots: [
                  {
                    name: 'default',
                    value: `${attachment.schoolName}：`,
                  },
                ],
              },
              ...getFileItem(attachment, index + 1 < attachments.length),
            ],
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
  return {
    label,
    value: emptyValue,
    ...extra,
  };
}
