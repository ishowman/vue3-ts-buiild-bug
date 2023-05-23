export const copySettings = [
  {
    title: '教室',
    settings: [
      { label: '教室設定', key: 'enable_school' },
      { label: '指導報告書設定', key: 'enable_report' },
      { label: 'ポイント設定', key: 'enable_point' },
      { label: '教材登録', key: 'enable_school_textbook' },
    ],
  },
  {
    title: 'お知らせ',
    settings: [
      { label: 'テンプレート設定', key: 'enable_news_tpl' },
      { label: 'タグ設定', key: 'new_tags' },
    ],
  },
  {
    title: '講師連絡',
    settings: [{ label: 'テンプレート設定', key: 'enable_teacher_news' }],
  },
  {
    title: '請求書',
    settings: [
      { label: '請求項目設定', key: 'enable_invoice' },
      { label: 'テンプレート設定', key: 'enable_invoice_tpl' },
      { label: 'omiseAPI設定', key: 'omise_setting' },
      { label: '全銀フォーマット設定', key: 'zengin_setting' },
      { label: '保護者口座振替設定', key: 'parent_account_setting' },
    ],
  },
  {
    title: '成績管理',
    settings: [
      { label: 'テスト・科目名設定', key: 'enable_score' },
      { label: 'テンプレート設定', key: 'achievement_template' },
      { label: '成績管理設定', key: 'parent_inputs' },
    ],
  },
  {
    title: '宿題管理',
    settings: [{ label: '宿題管理設定', key: 'homework_setting' }],
  },
  {
    title: '座席管理',
    settings: [
      { label: '閉室日設定', key: 'seat_close_setting' },
      { label: 'ブース管理', key: 'enable_seat_classroom' },
      { label: '座席設定', key: 'seat_setting' },
      { label: '授業時間設定（授業時間）', key: 'enable_seat_time' },
      { label: '授業時間設定（適用日）', key: 'seat_applicable_time_setting' },
    ],
  },
  {
    title: '予約管理',
    settings: [
      { label: '予約設定', key: 'register_setting' },
      { label: '時間設定', key: 'enable_register_time' },
      { label: 'スペース設定', key: 'enable_register_classroom' },
      { label: 'イベント設定', key: 'enable_event' },
    ],
  },
  {
    title: '進捗管理',
    settings: [
      { label: '学習計画テンプレート', key: 'enable_learning_plans_tpl' },
      { label: '進捗管理設定', key: 'learning_plan_settings' },
    ],
  },
  {
    title: '面談記録',
    settings: [{ label: 'テンプレート設定', key: 'interview_templates' }],
  },
  {
    title: '見込顧客管理',
    settings: [
      { label: 'ガントチャート設定', key: 'customer_settings' },
      { label: 'WEB申し込み設定', key: 'customer_application_setting' },
    ],
  },
  {
    title: 'ComiruAir',
    settings: [
      { label: 'Comiru連携設定', key: 'comiru_online_setting' },
      { label: 'ComiruAir設定', key: 'comiru_air_setting' },
    ],
  },
  {
    title: '勤怠管理',
    settings: [
      { label: '申請理由テンプレート設定', key: 'apply_templates' },
      { label: '勤怠設定', key: 'attends_settings' },
    ],
  },
  {
    title: '給与管理',
    settings: [{ label: '給与設定', key: 'salaries_settings' }],
  },
];

export const schoolDetailData = [
  { key: 'email', label: 'メールアドレス' },
  { key: 'tel', label: '電話番号（ハイフンなし）' },
  { key: 'initial_password', label: '初期パスワード(保護者)' },
  { key: 'icon', label: '教室アイコン' },
  { key: 'subjects', label: '科目' },
  {
    key: 'top.is_show_top_student_list',
    label: '本日の担当生徒一覧をトップ画面に表示する',
  },
  {
    key: 'top.if_show_last_homework_and_subject',
    label: '本日の担当生徒一覧の「前回の実施単元」や「前回の宿題」表示・非表示',
  },
  {
    key: 'top.is_show_top_all_student_list',
    label: '管理者には、その日に授業がある全生徒を表示する',
  },
  {
    key: 'top.is_show_task_manage_to_top',
    label: 'タスク管理設定 - トップ画面表示',
  },
  {
    key: 'alert_settings.if_show_alert_to_top',
    label: 'トップアラート設定 - トップ画面表示',
  },
  { key: 'student_no.automatic_assign', label: '生徒番号設定 - 自動割振' },
  { key: 'student_type_filter', label: '生徒区分のデフォルト設定' },
  { key: 'is_sending_all_teachers', label: '通知設定 - コメント通知' },
  { key: 'is_using_birthday_email', label: '通知設定 - 誕生日通知' },
  { key: 'reserve_submit_settings', label: '予約送信のデフォルト設定' },
  { key: 'only_check_out', label: '入退室設定 - 利用区分' },
  { key: 'is_using_line_notify_touch', label: '入退室設定 - LINE通知' },
  {
    key: 'display_confirmation_qr.enable',
    label: '入退室設定 - QR読取時のポップアップ表示',
  },
  {
    key: 'if_show_checkinout.enable',
    label: '入退室設定 - 一般講師の手動打刻',
  },
  {
    key: 'normal_teacher_can_qr_nfc_face_touch_other_teacher.enable',
    label:
      '入退室設定 - 一般講師権限でQRスキャナーを立ち上げた場合の講師QR読取',
  },
  {
    key: 'checkinout_break_rest.enable',
    label: '講師入退室設定 - 休憩機能を利用する',
  },
  { key: 'touch_email_text', label: '入退室メールに記載するメッセージ' },
  { key: 'is_show_payment', label: '請求書設定 - 保護者への表示設定' },
  { key: 'is_show_scores', label: '成績管理設定 - 保護者への表示設定' },
  { key: 'is_show_reports', label: '指導報告書設定 - 保護者への表示設定' },
  {
    key: 'report.if_show_report_to_student',
    label: '指導報告書設定 - 生徒への表示設定',
  },
  {
    key: 'is_show_g_reports',
    label: '集団用指導報告設定 - 保護者への表示設定',
  },
  {
    key: 'g_report.if_show_g_report_to_student',
    label: '集団用指導報告設定 - 生徒への表示設定',
  },
  { key: 'is_using_point', label: 'ポイント設定 - 使用有無' },
  {
    key: 'teachers_news.is_show_other_teachers_news',
    label: '管理者の講師連絡権限設定 - 講師連絡閲覧',
  },
  {
    key: 'teachers_news.is_show_other_teachers_news_comment',
    label: '管理者の講師連絡権限設定 - コメント閲覧',
  },
  {
    key: 'can_teacher_view_news_comment',
    label: '一般講師のお知らせ権限設定 - コメント閲覧',
  },
  {
    key: 'can_teacher_reply_news_comment',
    label: '一般講師のお知らせ権限設定 - コメント返信',
  },
  {
    key: 'news.can_submit_news',
    label: '一般講師のお知らせ権限設定 - お知らせ送信',
  },
  {
    key: 'can_teacher_view_contact_comment',
    label: '一般講師のお問い合わせ権限設定 - コメント閲覧',
  },
  {
    key: 'can_teacher_reply_contact_comment',
    label: '一般講師のお問い合わせ権限設定 - コメント返信',
  },
  {
    key: 'top.can_teacher_download_contact_csv',
    label: '一般講師のお問い合わせ権限設定 - CSVダウンロード',
  },
  { key: 'is_using_contact', label: 'お問い合わせ設定 - 使用有無' },
  {
    key: 'contact.sub_student_can_read_air_contacts',
    label: 'お問い合わせ設定 - ComiruAirアプリでの使用有無',
  },
  {
    key: 'top.if_show_inquiry_summary_top',
    label: 'お問い合わせ設定 - お問い合わせサマリ',
  },
  { key: 'contact_title', label: 'お問い合わせ設定 - タイトル' },
  { key: 'contact_content', label: 'お問い合わせ設定 - 本文' },
  {
    key: 'report_comment_tips',
    label: 'お問い合わせ設定 - 保護者のコメントの注意文',
  },
  {
    key: 'examination.can_view_examination',
    label: '一般講師の成績管理権限設定 - 閲覧',
  },
  {
    key: 'examination.can_create_examination',
    label: '一般講師の成績管理権限設定 - 新規作成',
  },
  {
    key: 'examination.can_edit_examination',
    label: '一般講師の成績管理権限設定 - 編集',
  },
  { key: 'is_using_absence_contact', label: '欠席・遅刻連絡設定 - 使用有無' },
  {
    key: 'contact.is_show_absence_contact_reason',
    label: '欠席・遅刻連絡設定 - 理由表示',
  },
  {
    key: 'contact.absence_contact_note',
    label: '欠席・遅刻連絡設定 - コメント欄の注意文',
  },
  {
    key: 'contact.is_show_absence_contact_to_top',
    label: '欠席・遅刻連絡設定 - 本日の欠席・遅刻生徒一覧をTOP画面に表示する',
  },
  {
    key: 'top.if_show_customers_to_top',
    label: '本日の体験生徒一覧をTOP画面に表示する',
  },
  { key: 'time_setting', label: '一般講師アクセス時間設定' },
  { key: 'ip_address', label: 'アクセス制限設定' },
  { key: 'auto_textbook_order', label: '受注パターン反映設定' },
  { key: 'upgrade_grade', label: '学年更新設定' },
  {
    key: 'login_qr_code_period',
    label: '初期ログインQRコード利用可能期間設定',
  },
  { key: 'student_order.default', label: '並び順デフォルト設定' },
  {
    key: 'student_order.category',
    label: 'カテゴリー内の並び順デフォルト設定',
  },
];

export const baseKeys = [
  'email',
  'tel',
  'initial_password',
  'icon',
  'subjects',
  'is_sending_all_teachers',
  'is_using_birthday_email',
  'only_check_out',
  'is_using_line_notify_touch',
  'touch_email_text',
  'is_show_payment',
  'is_show_scores',
  'is_show_reports',
  'is_show_g_reports',
  'is_using_point',
  'can_teacher_view_news_comment',
  'can_teacher_reply_news_comment',
  'can_teacher_view_contact_comment',
  'can_teacher_reply_contact_comment',
  'is_using_contact',
  'contact_title',
  'contact_content',
  'report_comment_tips',
  'is_using_absence_contact',
  'time_setting',
  'ip_address',
];
