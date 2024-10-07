import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { EChartsOption } from 'echarts';

import { ITheme, theme$ } from '../../../interfaces/theme-switch';
import { CoolTheme } from '../../utilities/EChartColorTheme';

import { AuthenticationService } from '../../services/authentication.service';
import { TransactionBudgetService } from '../../services/transaction-budget.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: [
    './dashboard-overview.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class DashboardOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('textSection') textSection!: ElementRef;

  theme: ITheme = 'dark';
  coolTheme = CoolTheme;

  userID: string | null = '';

  totalIncome: number = 0;
  totalExpenses: number = 0;
  expenseChangePercentage: string = '';
  incomeChangePercentage: string = '';

  activeIncomeTab: boolean = true;
  activeExpenseTab: boolean = false;

  selectedTime: string = 'week';

  greetingMessage: string = '';
  loggedUser: string = '';

  ngOnInit(): void {
    theme$.subscribe((theme) => (this.theme = theme));
    this.userID = this.authService.getUserId();

    this.authService.userId$.subscribe((userId) => {
      if (userId) {
        this.userID = userId;
        this.getTotalExpenses();
        this.getTotalIncome();
      }
    });

    this.chartOptions = this.incomeChartOptions;
    this.updateBarChart();
    this.setGreetingMessage();
  }

  // TOTAL INCOME AND EXPENSE
  getTotalExpenses(): void {
    if (!this.userID) return;
    this.transactionBudgetService.GetTotalExpense(this.userID).subscribe({
      next: (val) => {
        this.totalExpenses = val.totalCurrentExpenses;
        const previousExpenses = val.totalPreviousExpenses;

        if (previousExpenses > 0) {
          const change =
            ((previousExpenses - this.totalExpenses) / previousExpenses) * 100;
          this.expenseChangePercentage = `${change.toFixed(
            2
          )}% from last month`;
        } else this.expenseChangePercentage = 'N/A'; // Handle cases with no previous month data
      },
      error: (err) => this.toastr.error(err.error.error, 'Error'),
    });
  }
  getTotalIncome(): void {
    if (!this.userID) return;
    this.transactionBudgetService.GetTotalIncome(this.userID).subscribe({
      next: (val) => {
        this.totalIncome = val.totalCurrentIncome;
        const previousIncome = val.totalPreviousIncome;

        if (previousIncome > 0) {
          const change =
            ((this.totalIncome - previousIncome) / this.totalIncome) * 100;
          this.incomeChangePercentage = `${change.toFixed(2)}% from last month`;
        } else this.incomeChangePercentage = 'N/A'; // Handle cases with no previous month data
      },
      error: (err) => this.toastr.error(err.error.error, 'Error'),
    });
  }

  ngAfterViewInit(): void {
    this.resetAnimation();
  }

  constructor(
    private authService: AuthenticationService,
    private transactionBudgetService: TransactionBudgetService,
    private toastr: ToastrService,
    private renderer: Renderer2
  ) {
    effect(() => {
      const user = this.authService.getUser();
      if (user && user.displayName) this.loggedUser = user.displayName;
    });
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

  setGreetingMessage() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) this.greetingMessage = 'Good morning';
    else if (currentHour >= 12 && currentHour < 18)
      this.greetingMessage = 'Good afternoon';
    else this.greetingMessage = 'Good evening';
  }

  resetAnimation() {
    const element = this.textSection.nativeElement;
    this.renderer.removeClass(element, 'animate');
    void element.offsetWidth;
    this.renderer.addClass(element, 'animate');
  }

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
