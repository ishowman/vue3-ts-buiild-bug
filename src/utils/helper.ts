import { PREFMAP } from '@/constants';
import { isNumber, isString, useCssVar } from '@vueuse/core';
import axios from 'axios';
import type { MessageBoxState } from 'element-plus';
import { ref, h } from 'vue';
import CIconFont from '@/components/CIconFont.vue';
import type { DateTime } from '@/types';
import Encoding from 'encoding-japanese';
import dayjs from 'dayjs';

export function getCssVar(name: string) {
  const el = ref(null);

  return useCssVar(name, el).value;
}

export function numberFormat(num: number) {
  return new Intl.NumberFormat().format(num);
}

enum DataType {
  object = '[object Object]',
  array = '[object Array]',
}

export function isObject(data) {
  return Object.prototype.toString.call(data) === DataType.object;
}
export function isArray(data) {
  return Object.prototype.toString.call(data) === DataType.array;
}

export function isIterable(data: any) {
  return (
    typeof data === 'object' && typeof data?.[Symbol.iterator] === 'function'
  );
}

export function emptyFieldFormatter(value, placeholder = '-') {
  const isEmpty =
    (isObject(value) && Object.keys(value)?.length === 0) ||
    (isArray(value) && value.length === 0) ||
    [null, undefined, ''].includes(value);
  return {
    isEmpty,
    value: isEmpty ? placeholder : value,
  };
}

export function toCapital(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
export function getUrlParam(key: string) {
  if (!key) {
    return;
  }
  const urlParams = new URLSearchParams(location.search);
  return urlParams.get(key);
}

export function isImage(mime: string) {
  return mime.split('/')[0] === 'image';
}

export async function getAddressByZip(zipCode) {
  if (zipCode.length !== 7) {
    console.warn('zipCode should be 7 digits numbers');
    return;
  }
  const prefectureCode = zipCode.slice(0, 3);
  const { data } = await axios.get(
    `https://yubinbango.github.io/yubinbango-data/data/${prefectureCode}.js`
  );
  if (!data) {
    console.warn('no matched data, please check your zipCode');
    return;
  }
  const result = JSON.parse(data.match(/\{(.+?)\}/g)[0])[zipCode];
  if (!result) {
    console.warn('no matched data, please check your zipCode');
    return;
  }
  const [index, ...address] = result;
  return {
    prefecture: PREFMAP[index - 1],
    address: address.join(''),
  };
}

export interface IOption {
  id: number;
  label: string;
}

export const selectorOptions = (
  data: IOption[] = [],
  nameFields = ['id', 'name'],
  spliter = ' | '
): IOption[] => {
  if (!data.length) {
    return data;
  }
  return data.map((item) => {
    const label = nameFields.map((field) => item[field]).join(spliter);
    return {
      id: item.id,
      label,
    };
  });
};

export function patchOptions(items, defaultOptions, key = 'id') {
  for (const item of defaultOptions) {
    if (item[key]) {
      const index = items.findIndex((option) => +option[key] === +item[key]);
      if (index === -1) {
        items.unshift(item);
      }
    }
  }
}

interface ITypeConfirm {
  type?: MessageBoxState['type'];
  title?: MessageBoxState['title'];
  content?: MessageBoxState['message'];
  [key: string]: any;
}

export async function typedConfirm(opt?: ITypeConfirm) {
  try {
    const options: ITypeConfirm = {
      type: 'warning',
      title: 'このサイトを離れますか？',
      content: 'システムが変更を保存しない場合があります。',
      ...opt,
    };
    const { type, title, content, ...otherOpts } = options;
    const message =
      `${
        title
          ? `<p class="message-box_title text-base	font-bold text-primary">${title}</p>`
          : ''
      }` + `${content ? `<div class="font-normal mt-2">${content}</div>` : ''}`;
    await ElMessageBox.confirm(message, {
      confirmButtonText: opt?.confirmButtonText || '確認',
      cancelButtonText: opt?.cancelButtonText || '取消',
      type,
      showClose: false,
      dangerouslyUseHTMLString: true,
      icon: h(CIconFont as any, {
        name: 'icon-warning',
        color: `var(--el-color-warning)`,
        size: '22px',
      }),
      cancelButtonClass: 'is-plain',
      autofocus: false,
      ...otherOpts,
    });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export function getPercent(count: number, total: number) {
  if (!isNumber(count) || !isNumber(total)) {
    return 0;
  }
  if (total === 0) {
    return 0;
  }
  return Math.floor((count * 100) / total);
}

export async function detectFileEncoding(rawFile) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = ({ target }) => {
      if (target?.result) {
        const encoding = Encoding.detect(
          target.result as Parameters<typeof Encoding.detect>[0]
        );
        resolve(encoding);
      }
    };

    reader.onerror = () => {
      reader.abort();
      reject(new DOMException('parsing file failed.'));
    };

    reader.readAsBinaryString(rawFile);
  });
}

export enum encodingTypes {
  csv = 'csv',
  plain = 'plain',
}

export function downloadTextWithPresetEncoding(
  content: string,
  filename: string,
  type?: encodingTypes
) {
  const blob = createBlobWithPresetEncoding(content, type);
  return downloadBlob(blob, filename);
}

export function createBlobWithPresetEncoding(
  content: string,
  type: encodingTypes = encodingTypes.plain
) {
  const isWindows = /win/i.test(navigator.userAgent);

  const [encoding, charset, correctedContent] = isWindows
    ? ['SJIS' as Encoding.Encoding, 'Shift_JIS', content.replace(/¥/g, '￥')]
    : ['UTF8' as Encoding.Encoding, 'UTF-8', content];

  const targetEncodingArray = Encoding.convert(
    Encoding.stringToCode(correctedContent),
    {
      to: encoding,
      from: 'UNICODE',
    }
  );

  const targetData = new Uint8Array(targetEncodingArray);

  const blob = new Blob([targetData], {
    type: `text/${type}; charset=${charset}`,
  });

  return blob;
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement('a');
  const URL = window.URL || window.webkitURL;
  const herf = URL.createObjectURL(blob);
  a.href = herf;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(herf);
};

export function commentDate(
  // @ts-ignore：tells ts to ignore `Expression produces a union type that is too complex to represent.ts(2590)`
  dateString: DateTime
) {
  if (!isString(dateString) || !dateString) {
    return '';
  }
  const day = dayjs(dateString);
  const now = dayjs();

  if (day.isSame(now, 'day')) {
    return day.format('HH:mm');
  } else if (day.isSame(now, 'year')) {
    return day.format('MM-DD HH:mm');
  } else {
    return day.format('YYYY-MM-DD HH:mm');
  }
}
