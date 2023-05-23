import { apiClient } from '@/utils';

interface IRes {
  [key: string]: any;
}

const prefix = `auth`;

export async function loginApi(params: {
  email: string;
  password: string;
}): Promise<IRes> {
  return apiClient.post(`${prefix}/login`, params);
}

export async function getUserInfo(): Promise<IRes> {
  return apiClient.get(`${prefix}/info`);
}
