export interface IPaginationParams {
  page?: number;
  pagesize?: number;
  search?: Record<string, any>;
  order_by?: Record<string, 'desc' | 'asc'>;
  keyword?: string;
  [key: string]: any;
}

export interface IPaginationResponse {
  current_page: number;
  total_pages: number;
  total_records: number;
}
