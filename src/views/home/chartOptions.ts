export const studentMixChartOptions = {
  xField: 'time',
  yField: ['count', 'value'],
  yAxis: {
    value: {
      title: {
        text: '入/退塾数',
        position: 'end',
      },
    },
    count: {
      title: {
        text: '生徒数',
        position: 'end',
      },
    },
  },
  geometryOptions: [
    {
      geometry: 'line',
      seriesField: 'type',
      smooth: true,
      color: ['#52C41A'],
      legend: {
        marker: {
          symbol: (x, y, r) => {
            return [
              ['M', x - r / 2, y],
              ['L', x + r / 2, y],
            ];
          },
        },
      },
    },
    {
      geometry: 'column',
      isStack: true,
      seriesField: 'type',
      columnWidthRatio: 0.08,
      label: undefined, // 不显示柱子数值
      color: ['#16BFB7', '#FF9F43'],
      columnStyle: {
        radius: [20, 20, 0, 0],
      },
      legend: {
        marker: {
          symbol: 'circle',
        },
      },
      tooltip: {
        formatter: function (data) {
          return {
            name: data.type,
            value: Math.abs(data.value),
          };
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
  xAxis: { line: null },
};

export const invoiceChartOptions = {
  xField: 'time',
  yField: ['count', 'value'],
  yAxis: {
    count: {
      title: {
        text: '作成数',
        position: 'end',
      },
    },
    value: {
      title: {
        text: '合計金額',
        position: 'end',
      },
    },
  },
  geometryOptions: [
    {
      geometry: 'line',
      seriesField: 'type',
      smooth: true,
      color: ['#52C41A'],
      legend: {
        marker: {
          symbol: (x, y, r) => {
            return [
              ['M', x - r / 2, y],
              ['L', x + r / 2, y],
            ];
          },
        },
      },
    },
    {
      geometry: 'line',
      seriesField: 'type',
      smooth: true,
      color: ['#FF9F43'],
      legend: {
        marker: {
          symbol: (x, y, r) => {
            return [
              ['M', x - r / 2, y],
              ['L', x + r / 2, y],
            ];
          },
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
};

export const lineMixChartOptions = {
  xField: 'time',
  yField: ['count', 'value'],
  yAxis: {
    count: {
      title: {
        text: '作成数',
        position: 'end',
      },
    },
    value: {
      title: {
        text: '既読/返信数',
        position: 'end',
      },
    },
  },
  geometryOptions: [
    {
      geometry: 'line',
      seriesField: 'type',
      smooth: true,
      color: ['#52C41A'],
      legend: {
        marker: {
          symbol: (x, y, r) => {
            return [
              ['M', x - r / 2, y],
              ['L', x + r / 2, y],
            ];
          },
        },
      },
    },
    {
      geometry: 'line',
      seriesField: 'type',
      smooth: true,
      color: ['#16BFB7', '#FF9F43'],
      legend: {
        marker: {
          symbol: (x, y, r) => {
            return [
              ['M', x - r / 2, y],
              ['L', x + r / 2, y],
            ];
          },
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
};

export const usageRateChartOptions = {
  appendPadding: 10,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
  label: {
    type: 'inner',
    offset: '-50%',
    style: {
      textAlign: 'center',
      fontSize: 14,
    },
  },
  statistic: {
    title: false,
    content: {
      style: {
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '16px',
        color: '#16BFB7',
      },
      content: 'アプリ利用率',
    },
  },
  color: ['#16BFB7', '#D9D9D9'],
  legend: {
    position: 'bottom',
  },
};

export const genderRatioChartOptions = {
  appendPadding: 10,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
  label: {
    type: 'inner',
    offset: '-50%',
    style: {
      textAlign: 'center',
      fontSize: 14,
    },
  },
  statistic: {
    title: false,
    content: {
      style: {
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '16px',
        color: '#16BFB7',
      },
      content: '男女比率',
    },
  },
  color: ['#16BFB7', '#FF9F43'],
  legend: {
    position: 'bottom',
  },
};
