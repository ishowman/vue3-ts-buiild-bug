import { DraftNews, PublishedNews } from './news';

export const AccountRegisted = [1, '登録済み'];

export const LineStatus = [AccountRegisted, [2, '兄弟姉妹連携'], [9, '未登録']];

export const AccountStatus = [AccountRegisted, [0, '未登録']];

export const confirmStatus = ['承認待ち', '承認済'];

export const newsStatus = [
  { label: DraftNews, value: '下書き' },
  { label: PublishedNews, value: '公開' },
];
