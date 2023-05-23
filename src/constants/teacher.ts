export enum TeacherFieldsMap {
  id = 'ID',
  corporation_code = '会社講師コード',
  name = '名前',
  name_kana = 'フリガナ',

  email = 'メールアドレス',
  school_name = '教室名',
  status = '講師ステータス', // teacher only
  rank = '講師ランク', // teacher only

  tel = '電話番号',
  zip = '郵便番号',
  grade = '学年',
  address = '住所',

  address2 = '住所2',
  birthday = '生年月日',
  sex = '性別',
  emergency_contact_tels = '緊急連絡先', // teacher only

  emergency_contact_names = '緊急連絡先名',
  education_names = '学校', // teacher only
  department_names = '学部', // teacher only
  introducers = '紹介者', // teacher only

  start_days = '授業開始日',
  memos = 'メモ', // teacher only
  attachments = '添付ファイル', // teacher only
  periods = '在籍期間',

  is_browser_logged_in = 'ブラウザログイン', // teacher only
  is_active_app = 'アプリログイン',
  created_at = '作成日時',
  updated_at = '更新日時',

  operation = '操作',
}

export const TYPE_SUSPEND = 1000;
export const TYPE_STOP = 1001;
export const TYPE_REACTIVE = 1002;
export const TYPE_INIT = 1003;

export const teacherStatus = new Map([
  [TYPE_INIT, '在籍'],
  [TYPE_REACTIVE, '復職'],
  [TYPE_STOP, '退職'],
  [TYPE_SUSPEND, '休職'],
]);
