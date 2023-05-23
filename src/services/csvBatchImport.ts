import { apiClient } from '@/utils';

interface IParams {
  provider: string;
  action: 'config' | 'info' | 'validate' | 'start' | 'progress';
}

interface IInfoParams extends IParams {
  md5: string;
}

interface IProgessParams extends IParams {
  batch_id: string;
}

export async function getCsvBatchImportConfig(params: IParams): Promise<any> {
  return apiClient.get(`/csv-batch-handle`, { params });
}

export async function getCsvBatchImportInfo(params: IInfoParams): Promise<any> {
  return apiClient.get(`/csv-batch-handle`, { params });
}

export async function validateCsvBatchImportData(
  query: IParams,
  params: any
): Promise<any> {
  return apiClient.post(
    `/csv-batch-handle?provider=${query.provider}&action=${query.action}`,
    params
  );
}

export async function createCsvBatchImportJobs(
  query: IParams,
  params: any
): Promise<any> {
  return apiClient.put(
    `/csv-batch-handle?provider=${query.provider}&action=${query.action}`,
    params
  );
}

export async function getCsvBatchImportProgess(
  params: IProgessParams
): Promise<any> {
  return apiClient.get(`/csv-batch-handle`, { params });
}
