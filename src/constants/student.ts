export enum StudentFieldsMap {
  student_no = '生徒番号',
  id = 'ID',
  school_name = '教室',
  name = '名前',

  corporation_code = '会社生徒コード',
  grade = '学年',
  student_type = '生徒区分',
  student_status = 'ステータス',

  sex = '性別',
  real_birthday = '生年月日',
  tel = '電話番号',
  tels = '他の電話番号',

  zip = '郵便番号',
  prefecture = '都道府県',
  address = '住所',
  address2 = '住所2',

  courses_name = 'コース名',
  classes_name = 'クラス名',
  siblings = '兄弟姉妹',
  parent_name = '保護者名',

  emergency_contact_name = '緊急連絡先名',
  emergency_contact_phone = '緊急連絡先電話番号',
  education_type = '学校区分',
  education_prefecture = '都道府県',

  education_city = '市区町村',
  education_name = '学校',
  semester_type = '学期制',
  student_groups = 'グループ',

  pay_type = '支払方法',
  zengin = '生徒口座情報',
  in_school_date = '入会日',
  start_date = '授業開始日',

  out_school_date = '退会日',
  period = '在籍期間',
  zengin_setting = '口座',
  leave = 'アカウント停止',

  does_agree_terms = '初回ログイン',
  is_active_app = 'アプリ',
  line_status = 'LINE',
  email_status = 'メールアドレス',

  card_status = 'クレジットカード',
  veritrans_status = 'ベリトランス口座',
  is_alumni = '卒業生',
  created_at = '作成日時',

  updated_at = '生徒情報の最終更新日時',
  operation = '操作',
}

export const ZERO = 1000; // 0
export const ONE = 1001; // 1
export const TWO = 1002; // 2
export const THREE = 1003; // 3
export const KINDERGARDEN_GRADE_1 = 1; // 3
export const KINDERGARDEN_GRADE_2 = 2; // 4
export const KINDERGARDEN_GRADE_3 = 3; // 5 year old
export const ELEMENTARY_GRADE_1 = 4; // 6 year old
export const ELEMENTARY_GRADE_2 = 5; // 7
export const ELEMENTARY_GRADE_3 = 6; // 8
export const ELEMENTARY_GRADE_4 = 7; // 9
export const ELEMENTARY_GRADE_5 = 8; // 10
export const ELEMENTARY_GRADE_6 = 9; // 11
export const JUNIOR_HIGH_GRADE_1 = 10; // 12
export const JUNIOR_HIGH_GRADE_2 = 11; // 13
export const JUNIOR_HIGH_GRADE_3 = 12; // 14
export const HIGH_GRADE_1 = 13; // 15
export const HIGH_GRADE_2 = 14; // 16
export const HIGH_GRADE_3 = 15; // 17
export const UNIVERSITY_GRADE_1 = 16; // 18
export const UNIVERSITY_GRADE_2 = 17; // 19
export const UNIVERSITY_GRADE_3 = 18; // 20
export const UNIVERSITY_GRADE_4 = 19; // 21
export const UNIVERSITY_GRADE_5 = 20; // 22
export const MASTER_GRADE_1 = 21; // 18
export const MASTER_GRADE_2 = 22; // 19
export const DOCTOR_GRADE_1 = 23; // 20
export const DOCTOR_GRADE_2 = 24; // 21
export const DOCTOR_GRADE_3 = 25; // 22
export const UNIVERSITY_GRADE = 50; // 18-
export const WORKING_PEOPLE = 90; // ???
export const ALREADY_GRADUATED = 99;
export const UNKNOWN = 0;

export const GradesTransilation = {
  [ZERO]: '0歳',
  [ONE]: '1歳',
  [TWO]: '2歳',
  [THREE]: '3歳',
  [KINDERGARDEN_GRADE_1]: '年少',
  [KINDERGARDEN_GRADE_2]: '年中',
  [KINDERGARDEN_GRADE_3]: '年長',
  [ELEMENTARY_GRADE_1]: '小1',
  [ELEMENTARY_GRADE_2]: '小2',
  [ELEMENTARY_GRADE_3]: '小3',
  [ELEMENTARY_GRADE_4]: '小4',
  [ELEMENTARY_GRADE_5]: '小5',
  [ELEMENTARY_GRADE_6]: '小6',
  [JUNIOR_HIGH_GRADE_1]: '中学1年生',
  [JUNIOR_HIGH_GRADE_2]: '中学2年生',
  [JUNIOR_HIGH_GRADE_3]: '中学3年生',
  [HIGH_GRADE_1]: '高校1年生',
  [HIGH_GRADE_2]: '高校2年生',
  [HIGH_GRADE_3]: '高校3年生',
  [UNIVERSITY_GRADE_1]: '大学生1年生',
  [UNIVERSITY_GRADE_2]: '大学生2年生',
  [UNIVERSITY_GRADE_3]: '大学生3年生',
  [UNIVERSITY_GRADE_4]: '大学生4年生',
  [UNIVERSITY_GRADE_5]: '大学生5年生',
  [MASTER_GRADE_1]: '修士1年生',
  [MASTER_GRADE_2]: '修士2年生',
  [DOCTOR_GRADE_1]: '博士1年生',
  [DOCTOR_GRADE_2]: '博士2年生',
  [DOCTOR_GRADE_3]: '博士3年生',
  [UNIVERSITY_GRADE]: '大学生',
  [WORKING_PEOPLE]: '社会人',
  [ALREADY_GRADUATED]: '既卒',
  [UNKNOWN]: '不明',
};

// Why: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map#objects_%E5%92%8C_maps_%E7%9A%84%E6%AF%94%E8%BE%83
export const GradesMap = new Map([
  [ZERO, '0歳'],
  [ONE, '1歳'],
  [TWO, '2歳'],
  [THREE, '3歳'],
  [KINDERGARDEN_GRADE_1, '年少'],
  [KINDERGARDEN_GRADE_2, '年中'],
  [KINDERGARDEN_GRADE_3, '年長'],
  [ELEMENTARY_GRADE_1, '小学1年生'],
  [ELEMENTARY_GRADE_2, '小学2年生'],
  [ELEMENTARY_GRADE_3, '小学3年生'],
  [ELEMENTARY_GRADE_4, '小学4年生'],
  [ELEMENTARY_GRADE_5, '小学5年生'],
  [ELEMENTARY_GRADE_6, '小学6年生'],
  [JUNIOR_HIGH_GRADE_1, '中学1年生'],
  [JUNIOR_HIGH_GRADE_2, '中学2年生'],
  [JUNIOR_HIGH_GRADE_3, '中学3年生'],
  [HIGH_GRADE_1, '高校1年生'],
  [HIGH_GRADE_2, '高校2年生'],
  [HIGH_GRADE_3, '高校3年生'],
  [UNIVERSITY_GRADE_1, '大学生1年生'],
  [UNIVERSITY_GRADE_2, '大学生2年生'],
  [UNIVERSITY_GRADE_3, '大学生3年生'],
  [UNIVERSITY_GRADE_4, '大学生4年生'],
  [UNIVERSITY_GRADE_5, '大学生5年生'],
  [MASTER_GRADE_1, '修士1年生'],
  [MASTER_GRADE_2, '修士2年生'],
  [DOCTOR_GRADE_1, '博士1年生'],
  [DOCTOR_GRADE_2, '博士2年生'],
  [DOCTOR_GRADE_3, '博士3年生'],
  [UNIVERSITY_GRADE, '大学生'],
  [WORKING_PEOPLE, '社会人'],
  [ALREADY_GRADUATED, '既卒'],
  [UNKNOWN, '不明'],
]);

export enum StudentTypes {
  NORMAL = '1',
  TRIAL = '2',
  KOUSYUU = '3',
  SPECIAL = '4',
  OTHERS = '5',
}

export const StudentTypesMap = new Map([
  [StudentTypes.NORMAL, '通塾生'],
  [StudentTypes.TRIAL, '体験生'],
  [StudentTypes.KOUSYUU, '講習生'],
  [StudentTypes.SPECIAL, '特別生'],
  [StudentTypes.OTHERS, 'その他外部利用者'],
]);

export enum ZenginSettingTranslation {
  status_code = 'DBステータス',
  branch_number = 'DB枝番',
  created_at = '作成日時',
  updated_at = '更新日時',
  veritrans_status = '教室側ステータス',
}

export enum VeritransStatuses {
  '登録処理中' = 1,
  '登録正常完了',
  '金融機関での登録エラー',
  '口座振替サービスゲートウェイでの登録エラーまたは中止',
  '金融機関での登録中止' = 9,
  'Web 登録開始依頼受付済み' = 303,
}

export const OtherQuiteReason = 'その他(記入)';

export const QuiteReasons = [
  '進路決定',
  '成績不振',
  '他塾転向',
  '講師への不満',
  '転居',
  '月謝未納',
  '生徒間トラブル',
  '教室とのトラブル',
  '不明',
  '特になし',
  OtherQuiteReason,
];
