import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartEmptyState from './ChartEmptyState';

const TopSellingProductChart = ({ yearTopProduct }) => {
  const allQuantity = yearTopProduct?.total_quantity || [];
  const allName = yearTopProduct?.name || [];

  const allData = allQuantity.map((value, i) => ({
    value: parseFloat(value).toFixed(2) || 0,
    name: allName[i],
  }));

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '50%',
        data: allData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  if (!allData.length) return <ChartEmptyState />;

  return (
    <ReactECharts
      option={option}
      style={{ height: 400 }}
    />
  );
};

export default TopSellingProductChart;