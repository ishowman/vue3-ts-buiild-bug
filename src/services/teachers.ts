import { apiClient } from '@/utils';
import type { IPaginationParams } from './types';
const prefix = `teacher`;
export async function getTeachers(params: IPaginationParams): Promise<any> {
  return apiClient.get(`${prefix}s/list`, { params });
}

export async function getTeacherInfo(teacherID: number): Promise<any> {
  return apiClient.get(`${prefix}s/info`, { params: { id: teacherID } });
}

export async function setTeacherInfo(data: object): Promise<any> {
  return apiClient.put(`${prefix}s/info`, data);
}

export async function addAttachments(params): Promise<any> {
  return apiClient.post(`${prefix}s/attachments`, params);
}

export async function delAttachments(params): Promise<any> {
  return apiClient.delete(`${prefix}s/attachments`, { params });
}

export async function getInactiveTeachers(
  params: IPaginationParams
): Promise<any> {
  return apiClient.get(`inactive/${prefix}s/list`, { params });
}

export async function inactiveTeacherBatchConfirm(params): Promise<any> {
  return apiClient.put(`inactive/${prefix}s/batch-confirm`, params);
}

export async function inactiveTeacherConfirm(params): Promise<any> {
  return apiClient.put(`inactive/${prefix}s/confirm`, params);
}

export async function inactiveTeacherRecovery(params): Promise<any> {
  return apiClient.delete(`inactive/${prefix}`, { params });
}

export async function inactiveTeacherSchedule(params): Promise<any> {
  return apiClient.put(`inactive/${prefix}s/schedule`, params);
}

// teacher role apis
export async function getTeacherRoleBatchImportConfig(): Promise<any> {
  return apiClient.get(`${prefix}/role/batch-import/config`);
}

export async function getTeacherRoleBatchImportInfo(params): Promise<any> {
  return apiClient.get(`${prefix}/role/batch-import/batch-info`, { params });
}

export async function validateTeacherRoleCSVData(params): Promise<any> {
  return apiClient.post(`${prefix}/role/batch-import/data`, params);
}

export async function createTeacherRoleBatchImportJobs(params): Promise<any> {
  return apiClient.put(`${prefix}/role/batch-import/jobs`, params);
}

export async function getTeacherRoleBatchImportProgress(params): Promise<any> {
  return apiClient.get(`${prefix}/role/batch-import/progress`, { params });
}

export async function getTeacherBatchImportConfig(): Promise<any> {
  return apiClient.get(`${prefix}/batch-import/config`);
}

export async function getTeacherBatchImportInfo(params): Promise<any> {
  return apiClient.get(`${prefix}/batch-import/batch-info`, { params });
}

export async function validateTeacherCSVData(params): Promise<any> {
  return apiClient.post(`${prefix}/batch-import/data`, params);
}

export async function createTeacherBatchImportJobs(params): Promise<any> {
  return apiClient.put(`${prefix}/batch-import/jobs`, params);
}

export async function getTeacherBatchImportProgress(params): Promise<any> {
  return apiClient.get(`${prefix}/batch-import/progress`, { params });
}

export async function getTeacherCsvConditionData(params): Promise<any> {
  return apiClient.get(`${prefix}s/condition-csv-data`, {
    params,
  });
}

// teacher school apis
export async function getTeacherSchoolBatchImportConfig(): Promise<any> {
  return apiClient.get(`${prefix}/school/batch-import/config`);
}

export async function getTeacherSchoolBatchImportInfo(params): Promise<any> {
  return apiClient.get(`${prefix}/school/batch-import/batch-info`, { params });
}

export async function validateTeacherSchoolCSVData(params): Promise<any> {
  return apiClient.post(`${prefix}/school/batch-import/data`, params);
}

export async function createTeacherSchoolBatchImportJobs(params): Promise<any> {
  return apiClient.put(`${prefix}/school/batch-import/jobs`, params);
}

export async function getTeacherSchoolBatchImportProgress(
  params
): Promise<any> {
  return apiClient.get(`${prefix}/school/batch-import/progress`, { params });
}
// teacher-news
export async function getTeacherNewsList(params): Promise<any> {
  return apiClient.get(`${prefix}-news/list`, { params });
}

export async function getTeacherNews(params): Promise<any> {
  return apiClient.get(`${prefix}-news`, { params });
}

export async function deleteTeacherNews(params): Promise<any> {
  return apiClient.delete(`${prefix}-news`, { params });
}

export async function getExistingTeacher(params): Promise<any> {
  return apiClient.get(`${prefix}-news/existing-teachers`, { params });
}

export async function saveTeacherNews(params): Promise<any> {
  return apiClient.post(`${prefix}-news`, params);
}

export async function getTeacherNewsSchoolAreaList(params): Promise<any> {
  return apiClient.get(`${prefix}-news/school-area-list`, { params });
}

export async function getTeacherNewsPreview(params): Promise<any> {
  return apiClient.get(`${prefix}-news/preview`, { params });
}
// role
export async function getTeacherRoleList(params): Promise<any> {
  return apiClient.get(`${prefix}-role/list`, { params });
}

export async function saveNewsComment(params): Promise<any> {
  return apiClient.post(`${prefix}-news/comments`, params);
}

export async function deleteTeacherNewsComment(params): Promise<any> {
  return apiClient.delete(`${prefix}-news/comments`, { params });
}

export async function editTeacherNewsInfo(params): Promise<any> {
  return apiClient.post(`${prefix}-news/info`, params);
}

export async function getTeacherNewsTemplateList(params): Promise<any> {
  return apiClient.get(`${prefix}-news-template/list`, { params });
}

export async function delTeacherNewsTemplate(params): Promise<any> {
  return apiClient.delete(`${prefix}-news-template`, { params });
}

export async function teacherNewsTemplateFastCopy(params): Promise<any> {
  return apiClient.put(`${prefix}-news-template/fast-copy`, params);
}

export async function createTeacherNewsTemplate(params): Promise<any> {
  return apiClient.post(`${prefix}-news-template`, params);
}

export async function teacherNewsTemplateCopy(params): Promise<any> {
  return apiClient.put(`${prefix}-news-template/copy`, params);
}
