import { Component, OnInit } from '@angular/core';

import { EChartsOption } from 'echarts';

import { ITheme, theme$ } from '../../../interfaces/theme-switch';
import { CoolTheme } from '../../utilities/EChartColorTheme';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: [
    './dashboard-overview.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class DashboardOverviewComponent implements OnInit {
  theme: ITheme = 'dark';
  coolTheme = CoolTheme;

  activeIncomeTab: boolean = true;
  activeExpenseTab: boolean = false;

  selectedTime: string = 'week';

  ngOnInit(): void {
    theme$.subscribe((theme) => (this.theme = theme));
    this.chartOptions = this.incomeChartOptions;
    this.updateBarChart();
  }

  chartOptions: EChartsOption = {};

  // Data for Income Categories
  incomeChartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: 'Income Categories',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 335, name: 'Salary' },
          { value: 310, name: 'Investments' },
          { value: 234, name: 'Freelancing' },
          { value: 135, name: 'Other' },
        ],
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

  // Data for Expense Categories
  expenseChartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: 'Expense Categories',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 400, name: 'Rent' },
          { value: 320, name: 'Groceries' },
          { value: 245, name: 'Entertainment' },
          { value: 150, name: 'Utilities' },
        ],
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

  incomeTab() {
    this.activeIncomeTab = true;
    this.activeExpenseTab = !this.activeIncomeTab;
    this.chartOptions = this.incomeChartOptions;
  }
  expenseTab() {
    this.activeExpenseTab = true;
    this.activeIncomeTab = !this.activeExpenseTab;
    this.chartOptions = this.expenseChartOptions;
  }

  // LINE CHART
  barChartOption: EChartsOption = {
    tooltip: {},
    legend: {
      data: ['Income', 'Expense'],
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Income',
        type: 'bar',
        data: [],
        itemStyle: { color: '#a7f3d0' },
        animation: true,
      },
      {
        name: 'Expense',
        type: 'bar',
        data: [],
        itemStyle: { color: '#fecdd3' },
        animation: true,
      },
    ],
  };

  updateBarChart() {
    if (this.selectedTime === 'week') {
      (this.barChartOption.xAxis as any).data = [
        'Week 1',
        'Week 2',
        'Week 3',
        'Week 4',
      ];
      (this.barChartOption.series as any)[0].data = [150, 200, 250, 300];
      (this.barChartOption.series as any)[1].data = [100, 150, 200, 250];
    } else {
      (this.barChartOption.xAxis as any).data = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
      ];
      (this.barChartOption.series as any)[0].data = [
        300, 500, 400, 600, 700, 800, 900,
      ];
      (this.barChartOption.series as any)[1].data = [
        200, 300, 250, 400, 500, 600, 700,
      ];
    }
    this.barChartOption = { ...this.barChartOption };
  }
}