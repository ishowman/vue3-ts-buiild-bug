import { apiClient } from '@/utils';
import type { IPaginationParams } from './types';
const prefix = `news`;

export async function getNews(params: IPaginationParams): Promise<any> {
  return apiClient.get(`${prefix}/list`, { params });
}

export async function getNewsTeachers(params: IPaginationParams): Promise<any> {
  return apiClient.get(`${prefix}/teacher/list`, { params });
}

export async function deleteNews(params: {
  ids: string | number[];
}): Promise<any> {
  return apiClient.delete(`${prefix}/batch/delete`, { params });
}

export async function publicNews(params: {
  ids: string | number[];
}): Promise<any> {
  return apiClient.put(`${prefix}/batch/public`, params);
}

export async function getNewsInfo(params: any): Promise<any> {
  return apiClient.get(`${prefix}/info`, { params });
}

export async function addNewsComment(params): Promise<any> {
  return apiClient.post(`${prefix}-comments`, params);
}

export async function getNewsTemplates(params: any): Promise<any> {
  return apiClient.get(`${prefix}/templates`, { params });
}

export async function saveNewsData(params: any, config = {}): Promise<any> {
  return apiClient.post(`${prefix}-data`, params, config);
}

export async function editNewsData(params: any, config = {}): Promise<any> {
  return apiClient.post(`${prefix}-detail`, params, config);
}

export async function delNewsSurveys(params: any): Promise<any> {
  return apiClient.delete(`${prefix}-survey`, { params });
}

export async function exportSurveyById(params: any): Promise<any> {
  return apiClient.get(`single-${prefix}/surveys/csv-data`, {
    params,
  });
}

export async function checkSurveyCount(params: any): Promise<any> {
  return apiClient.get(`${prefix}/surveys/count`, { params });
}

export async function exportNews(params: any): Promise<any> {
  return apiClient.get(`${prefix}/csv-data`, { params });
}

export async function exportSurveys(params: any): Promise<any> {
  return apiClient.get(`${prefix}/surveys/csv-data`, { params });
}

export async function getNewsTemplateList(params: any): Promise<any> {
  return apiClient.get(`${prefix}-template/list`, { params });
}

export async function copyNewsTemplate(params: any): Promise<any> {
  return apiClient.post(`${prefix}-template/fast-copy`, params);
}

export async function multipleCopyNewsTemplate(params: any): Promise<any> {
  return apiClient.post(`${prefix}-template/multiple-copy`, params);
}

export async function delNewsTemplate(params: any): Promise<any> {
  return apiClient.delete(`${prefix}-template`, { params });
}

export async function createNewsTemplate(params: any): Promise<any> {
  return apiClient.post(`${prefix}-template`, params);
}

export async function delNewsTemplateSurvey(params: any): Promise<any> {
  return apiClient.delete(`${prefix}-template/survey`, { params });
}

export async function getNewsTemplate(params: any): Promise<any> {
  return apiClient.get(`${prefix}-template`, { params });
}

export async function editNewsTemplateSurvey(params: any): Promise<any> {
  return apiClient.put(`${prefix}-template`, params);
}
