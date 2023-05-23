import { apiClient } from '@/utils';
const prefix = `educations`;

export async function getEducationsList(params): Promise<any> {
  return apiClient.get(`${prefix}/concise-list`, { params });
}

export async function getEducationsDepartments(params): Promise<any> {
  return apiClient.get(`${prefix}/departments-list`, { params });
}
