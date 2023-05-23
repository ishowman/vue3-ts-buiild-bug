import { apiClient } from '@/utils';
const prefix = `corporations`;

interface ICorporationInfoResponse {
  name: string;
  id: number;
  email: string;
  slug: string;
  min_date: string;
  max_date: string;
}

export async function getCorporationSchools(params): Promise<any> {
  return apiClient.get(`${prefix}/teacher/schools`, { params });
}

export async function getCorporationInfo(): Promise<{
  data: ICorporationInfoResponse;
}> {
  return apiClient.get(`${prefix}/info`);
}
