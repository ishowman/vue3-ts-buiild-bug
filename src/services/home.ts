import { apiClient } from '@/utils';
import type { IPaginationResponse } from './types';
const prefix = `dashboard`;

export interface IDashboardTotalDataResponse {
  students_total: number;
  teachers_total: number;
  news_total: number;
  report_total: number;
  invoices_total: number;
  schools_total: number;
  group_reports_total: number;
  corporation_notifications_total: number;
}

interface IRankingDataTableParams {
  page: number;
  pagesize: number;
  start_date: string;
  end_date: string;
  schools?: string;
  school_name?: string;
  owner_name?: string;
  sort?: string;
  sort_index?: number;
}

export interface IRankingDataTableResponse extends IPaginationResponse {
  items: (string | number)[];
  header: { label: string; children: string[] }[];
}

interface IRankingDataOverviewParams {
  start_date: string;
  end_date: string;
  schools?: string;
}

interface RankingDataOverviewItem {
  total: number;
  rate: number;
  prev_date_total: number;
}

interface RankingDataOverviewOtherItem {
  students_terms_count: number;
  students_active_app_count: number;
  news_read_rate: number;
  news_reply_rate: number;
  reports_read_rate: number;
  reports_reply_rate: number;
}

export interface IDashboardRankingDataOverviewResponse {
  other_data: RankingDataOverviewOtherItem;
  student_join_data: RankingDataOverviewItem;
  student_quit_data: RankingDataOverviewItem;
  invoices_data: RankingDataOverviewItem;
  total_money_data: RankingDataOverviewItem;
  news_data: RankingDataOverviewItem;
  reports_data: RankingDataOverviewItem;
  group_reports_data: RankingDataOverviewItem;
  is_adjacent_dates: boolean;
}

export async function getDashboardTotalData(): Promise<IDashboardTotalDataResponse> {
  return apiClient.get(`${prefix}/total-data-overview`);
}

export async function getDashboardRankingDataTable(
  params: IRankingDataTableParams
): Promise<IRankingDataTableResponse> {
  return apiClient.get(`${prefix}/ranking-data-table`, { params });
}

export async function getDashboardRankingDataOverview(
  params: IRankingDataOverviewParams
): Promise<{ data: IDashboardRankingDataOverviewResponse }> {
  return apiClient.get(`${prefix}/ranking-data-overview`, { params });
}

export async function exportDashboardRankingCsv(
  params: IRankingDataTableParams
): Promise<any> {
  return apiClient.get(`${prefix}/download-ranking-csv`, { params });
}
