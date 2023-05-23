import type { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';

import {
  apiClient,
  downloadTextWithPresetEncoding,
  encodingTypes,
} from '@/utils';
import Papa from 'papaparse';

interface IMeta {
  header: string[];
  page: number;
  pagesize: number;
  total_page: number;
  file_name?: string;
}

interface IResponse {
  meta: IMeta;
  data: string[][];
}

export function createCSVDownloader(
  method: 'post' | 'get',
  path: string,
  params?: Record<string, any>
) {
  const cache = {
    meta: {
      header: [],
      page: 1,
      pagesize: 100,
      total_page: 1,
    } as IMeta,
    data: [] as string[][],
    page: 1 as number,
  };

  const getParams = () => {
    const paramsWithPage = Object.assign(params ?? {}, { page: cache.page });

    return (
      method === 'get' ? { params: paramsWithPage } : paramsWithPage
    ) as AxiosRequestConfig;
  };

  const fetcher: () => Promise<IResponse> = () =>
    apiClient[method](path, getParams());

  return async function fetchLoop() {
    const { meta, data } = await fetcher();

    cache.meta = meta;
    cache.data = cache.data.concat(data);
    cache.page = meta.page;

    if (meta.page < meta.total_page) {
      cache.page = meta.page + 1;
      return fetchLoop();
    } else {
      return Promise.resolve([cache.meta, cache.data] as TCSVData)
        .then(processCSVData)
        .then(downloadCSV);
    }
  };
}

export function createSplitedPagedCSVDownloader(
  method: 'post' | 'get',
  path: string,
  paramsByPages: Record<string, any>[] = [{}]
) {
  const fetchers: (() => Promise<IResponse>)[] = paramsByPages?.map(
    (params) => () =>
      apiClient[method](path, method === 'get' ? { params } : params)
  );

  const fetchersByTimes = splitByPerTime(fetchers);
  const totalFetchingTimes = fetchersByTimes.length;

  const cache = {
    meta: {
      header: [],
      page: 1,
      pagesize: 100,
      total_page: 1,
    } as IMeta,
    data: [] as string[][],
    times: 1 as number,
  };

  return async function fetchLoop() {
    const times = cache.times;

    const responses = await Promise.all(
      fetchersByTimes[times - 1].map((fn) => fn())
    );

    const { meta } = responses[0];
    const data = responses.map(({ data }) => data).flat();

    cache.meta = meta;
    cache.data = cache.data.concat(data);
    cache.times = times + 1;

    if (times < totalFetchingTimes) {
      return fetchLoop();
    } else {
      return Promise.resolve([cache.meta, cache.data] as TCSVData)
        .then(processCSVData)
        .then(downloadCSV);
    }
  };
}

const PER_TIME = 10;

function splitByPerTime(reqs: any[]) {
  const count = reqs.length;
  const times = Math.ceil(count / PER_TIME);

  return Array(times)
    .fill('')
    .map((_, p) => reqs.slice(p * PER_TIME, (p + 1) * PER_TIME));
}

type TCSVData = [IMeta, string[][]];

function processCSVData([meta, data]: TCSVData) {
  return [
    meta,
    data.map((content) =>
      content.length === meta.header.length
        ? content
        : Object.assign(new Array(meta.header.length).fill(''), content)
    ),
  ] as TCSVData;
}

export function downloadCSV([{ header, file_name }, data]: [
  Pick<IMeta, 'header' | 'file_name'>,
  TCSVData[1]
]) {
  const csvData = [header].concat(data);

  const csvString = Papa.unparse(csvData);
  const today = dayjs().format('YYYY-MM-DD');
  const filename = `${file_name ?? today}.csv`;
  downloadTextWithPresetEncoding(csvString, filename, encodingTypes.csv);
}
