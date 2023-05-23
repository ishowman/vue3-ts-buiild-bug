export enum NewsFieldsMap {
  school_name = '教室',
  teacher_name = '書いた講師',
  title = 'タイトル',
  survey_count = 'アンケート',

  date = '日付',
  scheduled_time = '予約送信日時', // teacher only
  students = '宛先',
  status = '公開',

  is_public = '外部',
  can_comment = 'コメント機能',
  file_names = '添付ファイル',
  comment_updated_at = 'コメント更新日時',

  updated_at = '最終更新',
  operation = '操作',
}

export const newsFieldsConfig = [
  {
    label: '教室',
    labelWidth: 120,
    prop: 'school_name',
  },
  {
    label: '書いた講師',
    labelWidth: 100,
    prop: 'teacher_name',
  },
  {
    label: 'タイトル',
    labelWidth: 160,
    prop: 'title',
  },
  {
    label: 'アンケート',
    labelWidth: 120,
    prop: 'survey_count',
  },
  {
    label: '日付',
    labelWidth: 160,
    prop: 'date',
  },
  {
    label: '予約送信日時',
    labelWidth: 160,
    prop: 'scheduled_time',
  },
  {
    label: '宛先',
    labelWidth: 144,
    prop: 'students',
  },
  {
    label: '公開',
    labelWidth: 80,
    prop: 'status',
  },
  {
    label: '外部',
    labelWidth: 80,
    prop: 'is_public',
  },
  {
    label: 'コメント機能',
    labelWidth: 144,
    prop: 'can_comment',
  },
  {
    label: '添付ファイル',
    labelWidth: 144,
    prop: 'file_names',
  },
  {
    label: 'コメント更新日時',
    labelWidth: 160,
    prop: 'comment_updated_at',
  },
  {
    label: '最終更新',
    labelWidth: 160,
    prop: 'updated_at',
  },
  {
    label: '操作',
    labelWidth: 120,
    prop: 'operation',
  },
];

export const newsTemplateFieldsConfig = [
  {
    label: 'ID',
    labelWidth: 80,
    prop: 'id',
  },

  {
    label: '教室',
    labelWidth: 200,
    prop: 'school_name',
  },
  {
    label: 'タイトル',
    labelWidth: 160,
    prop: 'title',
  },
  {
    label: '日付',
    labelWidth: 100,
    prop: 'date',
  },

  {
    label: '本文',
    labelWidth: 160,
    prop: 'content',
  },

  {
    label: '作成日時',
    labelWidth: 160,
    prop: 'created_at',
  },
  {
    label: '実行',
    labelWidth: 280,
    prop: 'schools',
  },
  {
    label: '操作',
    labelWidth: 160,
    prop: 'operation',
  },
];

export enum newsTypes {
  choice = 'choice',
  text = 'text',
  month = 'month',
  date = 'date',
}

export enum NewsTeacherFieldsMap {
  school_name = '教室',
  teacher_name = '書いた講師',
  title = 'タイトル',
  date = '日付',

  scheduled_time = '予約送信日時', // teacher only
  teachers = '宛先',
  is_read = '既読数',
  status = '公開',

  last = '最終更新',
  operation = '操作',
}

export const newsTeacherFieldsConfig = [
  {
    label: '教室',
    labelWidth: 240,
    prop: 'school_name',
  },
  {
    label: '書いた講師',
    labelWidth: 100,
    prop: 'teacher_name',
  },
  {
    label: 'タイトル',
    labelWidth: 160,
    prop: 'title',
  },
  {
    label: '送信日',
    labelWidth: 160,
    prop: 'date',
  },

  {
    label: '予約送信日時',
    labelWidth: 160,
    prop: 'scheduled_time',
  },
  {
    label: '宛先',
    labelWidth: 144,
    prop: 'teachers',
  },
  {
    label: '既読数',
    labelWidth: 160,
    prop: 'is_read',
  },

  {
    label: '公開',
    labelWidth: 80,
    prop: 'status',
  },
  {
    label: '最終更新',
    labelWidth: 160,
    prop: 'last',
  },

  {
    label: '操作',
    prop: 'operation',
  },
];

export const newsTeacherPreviewFieldsConfig = [
  {
    label: 'ID',
    labelWidth: 80,
    prop: 'id',
  },
  {
    label: '名前',
    labelWidth: 160,
    prop: 'name',
  },
  {
    label: 'フリガナ',
    labelWidth: 160,
    prop: 'name_kana',
  },
  {
    label: 'メールアドレス',
    labelWidth: 240,
    prop: 'email',
  },

  {
    label: '教室名',
    prop: 'schools',
  },
];

export const DraftNews = 'draft';
export const PublishedNews = 'published';
