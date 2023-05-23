import { apiClient } from '@/utils';
import type { IPaginationParams, IPaginationResponse } from './types';
const prefix = `/group/reports`;

export interface IGroupReportItem {
  id: number;
  school_name: string;
  group_name: string;
  date: string;
  subjects: string;
  teacher_name: string;
  status: boolean;
  has_detail: boolean;
  created_at: string;
}

export interface IGroupReportInfo {
  date: string;
  lesson_text: string;
  homework_text: string;
  comment: string;
  note: string;
}

export interface IGroupReportsListResponse extends IPaginationResponse {
  items: IGroupReportItem[];
}

export interface IGroupReportInfoParams {
  id: number;
}

interface IListItem {
  label: string;
  value: number;
}

export async function getGroupReportsList(
  params: IPaginationParams
): Promise<IGroupReportsListResponse> {
  return apiClient.get(`${prefix}/list`, { params });
}

export async function getGroupReportInfo(
  params: IGroupReportInfoParams
): Promise<IGroupReportInfo> {
  return apiClient.get(`${prefix}/info`, { params });
}

export async function getGroupReportsTeacherList(params: {
  keyword?: string;
}): Promise<{ lists: IListItem[] }> {
  return apiClient.get(`${prefix}/teacher-list`, { params });
}

export async function getGroupReportsGroupList(params: {
  keyword?: string;
}): Promise<{ lists: IListItem[] }> {
  return apiClient.get(`${prefix}/group-list`, { params });
}
