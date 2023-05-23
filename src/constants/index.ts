export enum StorageKeys {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
  urlToken = 'token',
  userID = 'userID',
  email = 'email',
  name = 'name',
  nameKana = 'nameKana',
  avatar = 'avatar',
  mode = 'mode',
  studentFields = 'studentFields', // 生徒表格的显示字段配置
  teacherFields = 'teacherFields', // 講師的显示字段配置
  newsFields = 'newsFields', // お知らせ的显示字段配置
  adminInactiveTeacherFields = 'adminInactiveTeacherFields', // 講師-本部管理一覧的显示字段配置
  otherInactiveTeacherFields = 'otherInactiveTeacherFields', // 講師-その他一覧的显示字段配置
  newsTemplateFields = 'newsTemplateFields',
  newsTeacherFields = 'newsTeacherFields',
  newsTeacherTemplateFields = 'newsTeacherTemplateFields', // 講師連絡テンプレート的显示字段配置
  reportFields = 'reportFields', // 指導報告書的显示字段配置
  reportTemplateFields = 'reportTemplateFields', // 指導報告書模版的显示字段配置
  schoolFields = 'schoolFields', // 教室的显示字段配置
  schoolAccountsFields = 'schoolAccountsFields',
  groupReportFields = 'groupReportFields', // 集団指導報告書 的显示字段配置
  invoiceFields = 'invoiceFields',
  zenginStudentFields = 'zenginStudentFields',
  invoiceDraftFields = 'invoiceDraftFields', // 草稿字段
  invoiceZenginUploadFields = 'invoiceZenginUploadFields',
  invoiceZenginFields = 'invoiceZenginFields',
  schoolGroupsFields = 'schoolGroupsFields', // 教室グループ的显示字段配置
}

export enum StatusType {
  'primary',
  'success',
  'warning',
  'danger',
}

export enum PayType {
  '銀行振込' = 1,
  'クレジットカード',
  '口座振替',
  '月謝',
  '口座振替（ベリトランス）',
  'コンビニ払い',
}

export enum ButtonIconHeight {
  small = '12px',
  default = '14px',
  large = '16px',
}

export enum Sex {
  UNKNOW,
  MALE,
  FEMALE,
}

export const SexTranslations = [
  [Sex.UNKNOW, '不明'],
  [Sex.MALE, '男'],
  [Sex.FEMALE, '女'],
];

export const SexMap = new Map([
  [Sex.UNKNOW, '不明'],
  [Sex.MALE, '男'],
  [Sex.FEMALE, '女'],
]);

export const MaxPageSize = 100;
export const DefaultPageSize = 20;

export const MaxTimestamp = Date.parse('2035/12/31 UTC');
export const MinTimestamp = Date.parse('1969/12/31 UTC');

export const maxFileSize = 5 * 1024 * 1024; // max file size 5MB
export const PREFMAP = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

export const DefaultSlot = 'default';

export * from './student';
export * from './leave';
export * from './status';
export * from './teacher';
export * from './inactiveTeacher';
export * from './invoices';
export * from './news';
export * from './report';
export * from './school';
export * from './groupReport';

export * from './element';
