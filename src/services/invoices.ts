import { apiClient } from '@/utils';
import type { IPaginationParams, IPaginationResponse } from './types';
const prefix = `invoices`;
export interface IInvoiceItem {
  id: number;
  invoice_no: string;
  texthead: string;

  date: string;
  scheduled_time: string;
  is_reissued: boolean;
  new_transferred_invoices_count: number;
  has_transferred_invoices: boolean;
  status: string;
  grade: string;

  pay_date: string;
  pay_type: string;
  pay_type_value: number;

  can_use_card: boolean;
  payment_status?: string;
  omise?: string;

  memo: string;

  readed: boolean;
  paid_fail_reason?: string;
}

export interface IInvoicesListResponse extends IPaginationResponse {
  items: IInvoiceItem[];
  zengin_button_enable: boolean;
  zengin_corporation_button_enable: boolean;
}

export function getInvoicesList(
  params: IPaginationParams
): Promise<IInvoicesListResponse> {
  return apiClient.get(`${prefix}/list`, { params });
}

export function moveInvoicesToTrash(ids: number[]) {
  return apiClient.put(`${prefix}/trash`, { action: 'move_to_trash', ids });
}

export function moveInvoicesTrash(params) {
  return apiClient.delete(`${prefix}/delete-from-trash`, { params });
}

export function recoverInvoicesFromTrash(ids: number[]) {
  return apiClient.put(`${prefix}/trash`, {
    action: 'recover_from_trash',
    ids,
  });
}

export type IUpdateInvoiceMemoParams = Pick<IInvoiceItem, 'id' | 'memo'>;

export function updateInvoiceMemo({ id, memo }: IUpdateInvoiceMemoParams) {
  return apiClient.put(`${prefix}/update-memo`, { id, memo });
}

export interface IInvoiceDetail {
  texthead: string;
  is_using_discount: boolean;
  all_discount_price: number;
  discount: number;
  invoice_no: string;
  date: string;
  student_name: string;
  text1: string;
  text2: string;
  text3: string;
  total_price: number;
  pay_type: string;
  pay_date: string;
  change_reason: string;
  total_tax: number;
  tax: number;
  real_total_price: number;
  funds: IInvoiceFund[];
}

export interface IInvoiceFund {
  item: string;
  detail: string;
  amount: number;
  unit_price: number;
  total_price: number;
  is_using_discount: string;
  discount_type: string;
  discount: number;
  tax_free: string;

  discount_detail?: boolean;
}

interface IDownloadParams {
  ids?: number[];
  search?: Record<string, string | number | boolean | undefined | null>;
}

interface IDownloadParams {
  ids?: number[];
  search?: Record<string, string | number | boolean | undefined | null>;
}

export interface IInvoiceCorporationZenginItem {
  id: number;
  type: string;
  info: string;
  consignor_code: string;
  name: string;
  name_kana: string;
  bank_code: string;
  bank_name: string;
  bank_branch_code: string;
  bank_branch_kana: string;
  bank_account_type: string;
  bank_account_no: string;
}

interface IInvoiceCorporationZenginResponse extends IPaginationResponse {
  items: IInvoiceCorporationZenginItem[];
}

export function getInvoiceCorporationZenginList(
  params: IPaginationParams
): Promise<IInvoiceCorporationZenginResponse> {
  return apiClient.get('corporation-zengins', { params });
}

export function getInvoiceCorporationZenginTypes(): Promise<
  { key: number; item: string }[]
> {
  return apiClient.get('corporation-zengins/filter-type-options');
}

export function batchDeleteInvoiceCorporationZengin(params: {
  ids: string;
}): Promise<any> {
  return apiClient.delete('corporation-zengins/batch/delete', { params });
}

export function getInvoiceCorporationZenginInfo(params: any): Promise<any> {
  return apiClient.get('corporation-zengins/detail', { params });
}

export function createInvoiceCoporationZengin(params: any): Promise<any> {
  return apiClient.post('corporation-zengins/store', params);
}

export function updateInvoiceCoporationZengin(params: any): Promise<any> {
  return apiClient.put('corporation-zengins/update', params);
}

export function getInvoiceDetail(id: number): Promise<IInvoiceDetail> {
  return apiClient.get(`${prefix}/show`, { params: { id } });
}

export function getStudentZengins(): Promise<any> {
  return apiClient.get(`${prefix}/student-zengins-options`);
}

export function getZenginUploadTypes(): Promise<any> {
  return apiClient.get(`${prefix}/zengin-upload/types`);
}

export function zenginUpload(params): Promise<any> {
  return apiClient.post(`${prefix}/zengin-upload`, params);
}

type TGrades = { key: number; value: string }[];

export function getGradesWithInvoices(): Promise<TGrades> {
  return apiClient.get(`invoices/filter-grades`);
}

interface IDownloadParams {
  ids?: number[];
  search?: Record<string, string | number | boolean | undefined | null>;
  type?: 'corporation';
}

interface IVerifyDownloadDataResult {
  data: number[];
  meta: {
    count: number;
    total: number;
  };
  status_error_num: number;
  pay_date_error_num: number;
  pay_date_str: string;
  zero_price_invoice_num?: number;
  zengin_formats?: { id: string; type: string; item: string }[];
  types?: Record<string, Record<string, Record<string, string>>>;
}

export function verifyZenginData({
  ids,
  search,
  type,
}: IDownloadParams): Promise<IVerifyDownloadDataResult> {
  return apiClient.get(`invoices/zengin-download/prepare`, {
    params: {
      ...(ids ? { ids: ids.join(',') } : search),
      ...(type ? { type } : undefined),
    },
  });
}

export function verifyZenginCorporationData({
  ids,
  search,
}: IDownloadParams): Promise<IVerifyDownloadDataResult> {
  return verifyZenginData({ ids, search, type: 'corporation' });
}

export function verifyVeritransData({
  ids,
  search,
}: IDownloadParams): Promise<IVerifyDownloadDataResult> {
  return apiClient.get(`invoices/veri-data`, {
    params: { ...(ids ? { ids: ids.join(',') } : search) },
  });
}

interface IDownloadZenginParams extends IDownloadParams {
  zengin_format: number;
  school_id: number;

  use_student_no?: boolean;
  corporation_zengin_id?: number;
  get_date?: string;
  trailer_record_switch?: boolean;
  pattern?: number;
  created_at?: string;
  update_at?: string;
}

interface IDownloadData {
  encode: string;
  content: string;
  file_name: string;
}

export function downloadZenginData({
  ids,
  search,
  ...others
}: IDownloadZenginParams): Promise<IDownloadData> {
  return apiClient.post(`invoices/zengin-download`, {
    ...(ids ? { ids: ids.join(',') } : search),
    ...others,
  });
}

export function downloadZenginCorporationData({
  ids,
  search,
  ...others
}: IDownloadParams): Promise<IDownloadData> {
  return apiClient.post(`invoices/corporation-zengin-download`, {
    ...(ids ? { ids: ids.join(',') } : search),
    ...others,
  });
}

export function downloadVeritransData({
  ids,
  search,
}: IDownloadParams): Promise<IDownloadData> {
  return apiClient.post(`invoices/veri-export`, {
    ...(ids ? { ids: ids.join(',') } : search),
  });
}

// -----------------------------------------------
// 生徒口座管理
// -----------------------------------------------

export interface IZenginStudentItem {
  id: number;
  school_id: number;
  student_id: number;
  name: string;
  name_kana: string;
  bank_code: string;
  bank_name: string;
  bank_branch_code: string;
  bank_branch_kana: string;
  bank_branch_type: string;
  bank_branch_no: string;
  student: {
    id: number;
    grade: string;
    student_no: string;
    name: string;
  };
  school: {
    id: number;
    name: string;
  };
  grade_name: string;
  bank_account_type_name: string;
  bank_code_name: string;
}

export interface IZenginStudentListResponse extends IPaginationResponse {
  items: IZenginStudentItem[];
  create_permission: boolean;
  edit_permission: boolean;
  delete_permission: boolean;
}

export function getZenginStudentList(params: IPaginationParams) {
  return apiClient.get(`student-zengin/list`, {
    params,
  }) as Promise<IZenginStudentListResponse>;
}

export function deleteZenginStudent(ids: number[]) {
  return apiClient.delete(`student-zengin`, { params: { ids: ids.join(',') } });
}

interface ISearchZenginStudentFilterOptionsParams {
  school_id?: string;
  student_id?: string;
  student_no?: string;
}

interface ISchool {
  id: number;
  name: string;
}
interface IStudent {
  id: number;
  name: string;
  student_no: string;
  school: ISchool;
}

interface ISearchZenginStudentFilterOptionsResult {
  school_id?: ISchool[];
  student_id?: IStudent[];
  student_no?: IStudent[];
}

export function searchZenginStudentFilterOptions({
  school_id = '',
  student_id = '',
  student_no = '',
}: ISearchZenginStudentFilterOptionsParams) {
  if (school_id === '' && student_id === '' && student_no === '') {
    return Promise.resolve({
      school_id: [],
      student_id: [],
      student_no: [],
    });
  }

  return apiClient.get(`student-zengin/list/search-options`, {
    params: {
      search: {
        school_id,
        student_id,
        student_no,
      },
    },
  }) as ISearchZenginStudentFilterOptionsResult;
}

export function searchZenginStudentAllBankCodes(): Promise<{
  items: { label: string; value: string }[];
}> {
  return apiClient.get(`student-zengin/all-bank-codes`);
}

export interface IZenginStudentForm {
  school_id: number;
  student_id: number;
  name: string;
  name_kana: string;
  bank_code: string;
  bank_name: string;
  bank_branch_code: string;
  bank_branch_kana: string;
  bank_branch_type: number;
  bank_account_no: string;

  student?: {
    id: number;
    name: string;
  };
}

export function createZenginStudent(form: IZenginStudentForm) {
  return apiClient.post(`student-zengin`, form) as Promise<IZenginStudentForm>;
}

export function getZenginStudent(id: number) {
  return apiClient.get(`student-zengin`, {
    params: { id },
  }) as Promise<IZenginStudentForm>;
}

export interface IZenginStudentUpdateForm extends IZenginStudentForm {
  id: number;
}

export function updateZenginStudent(form: IZenginStudentUpdateForm) {
  return apiClient.put(`student-zengin`, form) as Promise<IZenginStudentForm>;
}
