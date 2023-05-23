import { apiClient } from '@/utils';
import type { IPaginationParams } from './types';
const prefix = `school`;

export async function getSchoolList(params): Promise<any> {
  return apiClient.get(`${prefix}s/concise-list`, { params });
}

export async function getCourseList(params): Promise<any> {
  return apiClient.get(`${prefix}s/course/list`, { params });
}

export async function getClassList(params): Promise<any> {
  return apiClient.get(`${prefix}s/class/list`, { params });
}

export async function getClassByCorporation(params): Promise<any> {
  return apiClient.get(`${prefix}s/class/list/by-corporation`, { params });
}

export async function getSchoolAreas(): Promise<any> {
  return apiClient.get(`${prefix}s/areas`);
}

export async function getSchoolCourseGroups(
  params: IPaginationParams
): Promise<any> {
  return apiClient.get(`${prefix}s/course/groups`, { params });
}

export async function getSchoolGroups(params: IPaginationParams): Promise<any> {
  return apiClient.get(`${prefix}/groups`, { params });
}

export async function getSchoolEducations(): Promise<any> {
  return apiClient.get(`${prefix}s/educations`);
}

export async function getSchoolListByPage(params): Promise<any> {
  return apiClient.get(`${prefix}s/lists`, { params });
}

export async function getAllSchools(): Promise<any> {
  return apiClient.get(`${prefix}s/get-all-schools`);
}

export async function getAllSchoolGroups(): Promise<any> {
  return apiClient.get(`${prefix}s/get-all-groups`);
}

export async function saveSchoolCopySettings(params: any): Promise<any> {
  return apiClient.post(`${prefix}s/copy-setting`, params);
}

export async function previewSchoolCopySettings(params: any): Promise<any> {
  return apiClient.post(`${prefix}s/preview-copy-setting`, params);
}

export async function getSchoolOmiseSettingsList(params: {
  ids: string;
}): Promise<any> {
  return apiClient.get(`${prefix}s/omise-setting`, { params });
}

export async function updateSchoolOmiseSettings(params: {
  ids: string;
  omise_secret: string;
  omise_public: string;
}): Promise<any> {
  return apiClient.put(`${prefix}s/update-omise-setting`, params);
}

export async function getSchoolGroupsInfoIndex(params): Promise<any> {
  return apiClient.get(`${prefix}/group-infos/index`, { params });
}

export async function createSchoolGroupsInfo(params): Promise<any> {
  return apiClient.post(`${prefix}/group-infos`, params);
}

export async function updateSchoolGroupsInfo(params): Promise<any> {
  return apiClient.put(`${prefix}/group-infos`, params);
}

export async function deleteSchoolGroupsInfo(params): Promise<any> {
  return apiClient.delete(`${prefix}/group-infos`, { params });
}

export async function getSchoolGroupsInfoDetail(params): Promise<any> {
  return apiClient.get(`${prefix}/group-infos/detail`, { params });
}
