import { apiClient } from '@/utils';
import type { IPaginationParams, IPaginationResponse } from './types';
const prefix = `reports`;

export interface IReportItem {
  id: number;
  school_name: string;
  date: string;
  subjects: string;
  student_name: string;
  teacher_name: string;
  is_read: boolean;
  status: boolean;
  has_info: boolean;
  created_at: string;
}

export interface IReportInfo {
  date: string;
  lesson_text: string;
  homework_text: string;
  comment: string;
  note: string;
}

export interface IReportsListResponse extends IPaginationResponse {
  items: IReportItem[];
}

export interface IReportInfoParams {
  id: number;
}

export async function getReportsList(
  params: IPaginationParams
): Promise<IReportsListResponse> {
  return apiClient.get(`${prefix}/list`, { params });
}

export async function getReportInfo(
  params: IReportInfoParams
): Promise<IReportInfo> {
  return apiClient.get(`${prefix}/info`, { params });
}

export interface IReportTemplateItem {
  id: number;
  school_name: string;
  sort: number;
  template_name: string;
  template_lesson_text: string;
  template_homework_text: string;
  template_note: string;
  create_at: string;
  schools: { id: number; name: string }[];
}

export interface IReportTemplateListResponse extends IPaginationResponse {
  items: IReportTemplateItem[];
  edit_permission: boolean;
  delete_permission: boolean;
}

export function getReportTemplateList(
  params: IPaginationParams
): Promise<IReportTemplateListResponse> {
  return apiClient.get(`/report-template/list`, { params });
}

export function getSchoolListExcept(params: { except_school: number }) {
  return apiClient.get(`/schools/list/by-corporation`, { params });
}

export function copyReportTemplateToSchool(params: {
  template_id: number;
  school_id: number;
}) {
  return apiClient.post(`/report-template/copy`, params);
}

export function deleteReportTemplate(params: { id: number }) {
  return apiClient.delete(`/report-template/delete`, { params });
}

export interface IReportEditTemplateParams {
  id: number;
  sort: number;
  title?: string;
  lesson_text?: string;
  homework_text?: string;
  note?: string;
}

export function editReportTemplate(params: IReportEditTemplateParams) {
  return apiClient.put(`/report-template/update`, params);
}

export interface IReportBatchCopyParams {
  id: number;
  type: string;
  schools: number[];
}

export function batchCopyReportTemplateToSchool(
  params: IReportBatchCopyParams
) {
  return apiClient.put(`/report-template/multiple-copy`, params);
}
