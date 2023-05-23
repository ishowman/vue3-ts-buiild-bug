export const invoiceListFields = [
  { label: '請求日付', prop: 'date', width: 180 },
  { label: '教室', prop: 'school_name', width: 200 },
  { label: '請求', prop: 'status', width: 80 },
  { label: '学年', prop: 'grade', width: 80 },
  { label: '生徒名', prop: 'student_name', width: 200 },
  { label: '支払期限', prop: 'pay_date', width: 160 },
  { label: '支払方法', prop: 'pay_type', width: 200 },
  { label: '金額', prop: 'total_price', width: 120 },
  { label: '既読', prop: 'readed', width: 60 },
  { label: '支払ステータス', prop: 'payment_status', width: 120 },
  { label: 'メモ', prop: 'memo', width: 200 },
  { label: '決済失敗理由', prop: 'paid_fail_reason', width: 140 },
  { label: '操作', prop: 'operation', width: 90 },
];

export const invoiceFundListFields = [
  { label: '項目', prop: 'item', width: 130 },
  { label: '詳細', prop: 'detail', width: 130 },
  { label: '単価', prop: 'unit_price', width: 100 },
  { label: '数量', prop: 'amount', width: 100 },
  { label: '金額', prop: 'total_price', width: 100 },
  { label: '割引', prop: 'is_using_discount', width: 80 },
  { label: '割引方法', prop: 'discount_type', width: 100 },
  { label: '割引値', prop: 'discount', width: 100 },
  { label: '消費税対象外', prop: 'tax_free' },
];

export const zenginStudentFields = [
  { label: '教室名', prop: 'school.name', width: 130 },
  { label: '学年', prop: 'grade_name', width: 120 },
  { label: '生徒番号', prop: 'student.student_no', width: 80 },
  { label: '生徒名前', prop: 'student.name', width: 130 },
  { label: '口座名前', prop: 'name', width: 120 },
  { label: '口座名前（半角カナ）', prop: 'name_kana', width: 160 },
  { label: '請求先金融機関コード', prop: 'bank_code', width: 160 },
  {
    label: '請求先金融機関名（半角カナ英大文字）',
    prop: 'bank_name',
    width: 280,
  },
  { label: '請求先支店番号', prop: 'bank_branch_code', width: 120 },
  { label: '請求先支店名（半角カナ）', prop: 'bank_branch_kana', width: 200 },
  { label: '請求口座の預金科目', prop: 'bank_account_type_name', width: 150 },
  { label: '請求口座の口座番号', prop: 'bank_account_no', width: 150 },
  { label: '操作', prop: 'operation', width: 90 },
];

export const invoiceTrashFields = [
  {
    label: '請求日付',
    labelWidth: 160,
    prop: 'date',
  },
  {
    label: '教室',
    labelWidth: 160,
    prop: 'school_name',
  },
  {
    label: '請求',
    labelWidth: 80,
    prop: 'status',
  },
  {
    label: '学年',
    labelWidth: 80,
    prop: 'grade',
  },
  {
    label: '生徒名',
    labelWidth: 120,
    prop: 'student_name',
  },
  {
    label: '支払期限',
    labelWidth: 160,
    prop: 'pay_date',
  },
  {
    label: '支払方法',
    labelWidth: 200,
    prop: 'pay_type',
  },
  {
    label: '金額',
    labelWidth: 120,
    prop: 'total_price',
  },
  {
    label: '既読',
    labelWidth: 60,
    prop: 'readed',
  },
  {
    label: '支払ステータス',
    labelWidth: 120,
    prop: 'payment_status',
  },
  {
    label: 'メモ',
    labelWidth: 120,
    prop: 'memo',
  },
  {
    label: '操作',
    prop: 'operation',
  },
];

export const invoiceZenginUploadFieldsConfig = [
  {
    label: 'ステータス',
    labelWidth: 160,
    prop: 'status',
  },
  {
    label: '教室',
    labelWidth: 160,
    prop: 'school_name',
  },
  {
    label: '請求番号',
    labelWidth: 200,
    prop: 'request_no',
  },
  {
    label: '宛先',
    labelWidth: 160,
    prop: 'grade',
  },
  {
    label: '支払方法',
    labelWidth: 200,
    prop: 'pay_type',
  },
  {
    label: '金額',
    labelWidth: 120,
    prop: 'price',
  },
  {
    label: '既読',
    labelWidth: 60,
    prop: 'readed',
  },
  {
    label: '支払ステータス',
    labelWidth: 160,
    prop: 'payment_status',
  },
  {
    label: '理由',
    labelWidth: 80,
    prop: 'reason',
  },
];
export const invoiceZenginFields = [
  {
    label: '口座種別',
    labelWidth: 120,
    prop: 'type',
  },
  {
    label: '口座情報',
    labelWidth: 460,
    prop: 'info',
  },
  {
    label: '入金先金融機関コード',
    labelWidth: 180,
    prop: 'bank_code',
  },
  {
    label: '入金先金融機関名(半角カナ)',
    labelWidth: 200,
    prop: 'bank_name',
  },
  {
    label: '入金先支店番号',
    labelWidth: 180,
    prop: 'bank_branch_code',
  },
  {
    label: '入金先支店名(半角カナ)',
    labelWidth: 180,
    prop: 'bank_branch_kana',
  },
  {
    label: '入金口座の預金科目',
    labelWidth: 180,
    prop: 'bank_account_type',
  },
  {
    label: '入金口座の口座番号',
    labelWidth: 180,
    prop: 'bank_account_no',
  },
  {
    label: '操作',
    labelWidth: 90,
    prop: 'operation',
  },
];
