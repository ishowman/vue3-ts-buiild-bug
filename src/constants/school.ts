export const schoolFieldsConfig = [
  {
    label: 'ID',
    labelWidth: 80,
    prop: 'id',
  },
  {
    label: '教室スラッグ',
    labelWidth: 160,
    prop: 'slug',
  },
  {
    label: '教室名',
    labelWidth: 180,
    prop: 'name',
  },
  {
    label: 'フリガナ',
    labelWidth: 120,
    prop: 'name_kana',
  },
  {
    label: '管理区分',
    labelWidth: 120,
    prop: 'fc_flag',
  },
  {
    label: '郵便番号',
    labelWidth: 120,
    prop: 'zip',
  },
  {
    label: '住所',
    labelWidth: 160,
    prop: 'address',
  },
  {
    label: '住所2',
    labelWidth: 160,
    prop: 'address2',
  },
  {
    label: '電話番号',
    labelWidth: 120,
    prop: 'tel',
  },
  {
    label: '教室メールアドレス',
    labelWidth: 160,
    prop: 'email',
  },
];

export const schoolAccountsFieldsConfig = [
  {
    label: 'ID',
    labelWidth: 80,
    prop: 'id',
  },
  {
    label: '教室名',
    labelWidth: 120,
    prop: 'school.name',
  },
  {
    label: 'フリガナ',
    labelWidth: 120,
    prop: 'school.name_kana',
  },
  {
    label: '口座種別',
    labelWidth: 160,
    prop: 'type_name',
  },
  {
    label: '口座情報',
    labelWidth: 160,
    prop: 'info_title',
  },
  {
    label: '委託者コード',
    labelWidth: 120,
    prop: 'consignor_code',
  },
  {
    label: '委託者名',
    labelWidth: 120,
    prop: 'name',
  },
  {
    label: '委託者名（半角カナ）',
    labelWidth: 160,
    prop: 'name_kana',
  },
  {
    label: '金融機関コード',
    labelWidth: 120,
    prop: 'bank_code',
  },
  {
    label: '金融機関名（半角カナ）',
    labelWidth: 180,
    prop: 'bank_name',
  },
  {
    label: '支店番号',
    labelWidth: 120,
    prop: 'bank_branch_code',
  },
  {
    label: '支店名（半角カナ）',
    labelWidth: 160,
    prop: 'bank_branch_kana',
  },
  {
    label: '預金科目',
    labelWidth: 120,
    prop: 'bank_account_type_name',
  },
  {
    label: '口座番号',
    labelWidth: 120,
    prop: 'bank_account_no',
  },
  {
    label: '操作',
    labelWidth: 90,
    prop: 'operation',
  },
];

export const schoolGroupsFieldsConfig = [
  {
    label: 'グループ名',
    prop: 'name',
  },

  {
    label: 'グループコード',
    prop: 'code',
  },
  {
    label: '教室',
    labelWidth: 200,
    prop: 'school_lists',
  },
  {
    label: '操作',
    prop: 'operation',
  },
];
