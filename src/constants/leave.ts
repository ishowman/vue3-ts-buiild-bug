const TRANSFERRED = 'transferred';

const RESTED = 'rested';

const LEAVED = 'leaved';

const DELETED = 'deleted';

const COOLING_OFF = 'cooling-off';

const COMEBACK = 'comeback';

const TRANSFER = 'transfer';

export const LeaveStatusTranslation = [
  ['null', '在籍'],
  [COMEBACK, '復会'],
  [RESTED, '休会'],
  [LEAVED, '退会'],
  [COOLING_OFF, 'クーリングオフ'],
  [TRANSFERRED, '移籍済'],
  [DELETED, '削除'],
  [TRANSFER, '移籍受け'],
];

export enum LeaveFieldTranslation {
  leave_status = 'ステータス',
  quit_reason = '理由',
  schedule_date = '予約日',
}
