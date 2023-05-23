import { apiClient } from '@/utils';
import type { IPaginationParams } from './types';
const prefix = `school-accounts`;

export async function getSchoolAccountsList(
  params: IPaginationParams
): Promise<any> {
  return apiClient.get(`${prefix}/list`, { params });
}

export async function deleteSchoolAccount(params: {
  id: number;
}): Promise<any> {
  return apiClient.delete(`${prefix}`, { params });
}

export async function getSchoolAccountInfo(params: {
  id: string | string[];
}): Promise<any> {
  return apiClient.get(`${prefix}/detail`, { params });
}

export async function getSchoolAccountExistTypes(): Promise<any> {
  return apiClient.get(`${prefix}/exist-zengins`);
}

export async function createSchoolAccount(params: any): Promise<any> {
  return apiClient.post(`${prefix}/store`, params);
}

export async function updateSchoolAccount(params: any): Promise<any> {
  return apiClient.put(`${prefix}/update`, params);
}
