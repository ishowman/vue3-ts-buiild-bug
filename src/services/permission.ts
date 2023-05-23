import { apiClient } from '@/utils';

interface IRes {
  [key: string]: boolean;
}

export async function queryPermisson(params: {
  module: string;
}): Promise<IRes> {
  // params example:
  // {
  //   module: 'corporation.teacher'  // 讲师
  // }
  return apiClient.get(`permission`, { params });
}
