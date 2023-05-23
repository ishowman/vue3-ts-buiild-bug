import { apiClient } from '@/utils';
import type { IPaginationParams, IPaginationResponse } from './types';
const prefix = `student`;

interface IStudentReportItem {
  school_name: string;
  school_id: number;
  average_num: number;
  discount_num: number;
  data: {
    [key: string]: number;
  };
}

interface IStudentReportsListResponse extends IPaginationResponse {
  date_range: number[];
  is_show_discount_column: boolean;
  items: IStudentReportItem[];
}

export async function getStudents(params: IPaginationParams): Promise<any> {
  return apiClient.get(`${prefix}s/list`, { params });
}

export async function getStudentInfo(studentID: number): Promise<any> {
  return apiClient.get(`${prefix}s/show`, { params: { id: studentID } });
}

export async function setStudentInfo(data: object): Promise<any> {
  return apiClient.put(`${prefix}s/edit`, data);
}

export async function getStudentGroups(params): Promise<any> {
  return apiClient.get(`${prefix}/groups/list`, { params });
}

export async function searchStudents(params): Promise<any> {
  return apiClient.get(`${prefix}s/concise-list`, { params });
}

export async function getStudentSiblings(
  params: IPaginationParams = { pagesize: 500 }
): Promise<any> {
  return apiClient.get(`${prefix}s/siblings`, { params });
}

export async function getPayTypes(): Promise<any> {
  return apiClient.get(`${prefix}s/pay-types`);
}

export async function setStudentsLeavings(params): Promise<any> {
  return apiClient.put(`${prefix}s/leave`, params);
}

export async function getStudentSchoolGroups(): Promise<any> {
  return apiClient.get(`${prefix}/student-groups`);
}

export async function checkStudentGroups(params): Promise<any> {
  return apiClient.post(`${prefix}/groups/check`, params);
}

export async function saveStudentGroups(params): Promise<any> {
  return apiClient.post(`${prefix}/groups`, params);
}

export async function getBatchImportConfig(): Promise<any> {
  return apiClient.get(`${prefix}s/batch-import/config`);
}

export async function getBatchImportInfo(params): Promise<any> {
  return apiClient.get(`${prefix}s/batch-import/batch-info`, { params });
}

export async function validateCSVData(params): Promise<any> {
  return apiClient.post(`${prefix}s/batch-import/data`, params);
}

export async function createBatchImportJobs(params): Promise<any> {
  return apiClient.put(`${prefix}s/batch-import/jobs`, params);
}

export async function getBatchImportProgress(params): Promise<any> {
  return apiClient.get(`${prefix}s/batch-import/progress`, { params });
}

export async function getStudentReportsList(
  params
): Promise<IStudentReportsListResponse> {
  return apiClient.get(`${prefix}/reports/list`, { params });
}
