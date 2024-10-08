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
import {
  IIncome,
  ITransaction,
} from '../../../interfaces/TransactionBudget.interface';

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

  incomeList: IIncome[] = [];
  transactionList: ITransaction[] = [];

  incomeYearList: IIncome[] = [];
  transactionYearList: ITransaction[] = [];

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
        // FOR BAR CHART
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        this.loadIncomeList(year, month);
        this.loadTransactionList(year, month);
      }
    });

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
  incomeChartOptions: EChartsOption = {};
  expenseChartOptions: EChartsOption = {};

  // PIE CHART
  loadIncomeList(year: number, month: number) {
    this.transactionBudgetService
      .GetIncomeList(this.userID, year, month)
      .subscribe({
        next: (data) => {
          if (data.length <= 0)
            this.toastr.info(
              'No income source was found for this user of current month'
            );
          this.incomeList = data;
          this.loadIncomeChart(data);
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
  }

  // DATA FOR INCOME CATEGORES
  loadIncomeChart(data: any) {
    this.incomeChartOptions = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: 'Income Categories',
          type: 'pie',
          radius: '50%',
          data: data.map((income: IIncome) => ({
            value: income.amount,
            name: income.category,
          })),
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
    this.chartOptions = this.incomeChartOptions;
  }

  loadTransactionList(year: number, month: number) {
    this.transactionBudgetService
      .GetTransactionMonthWise(this.userID, year, month)
      .subscribe({
        next: (data) => {
          if (data.length <= 0)
            this.toastr.info(
              'No transaction was found for this user of current month'
            );
          this.transactionList = data;
          this.loadExpenseChart(data);
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
  }

  // DATA FOR EXPENSE CATEGORIES
  loadExpenseChart(data: ITransaction[]) {
    this.expenseChartOptions = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: 'Expense Categories',
          type: 'pie',
          radius: '50%',
          data: data.map((income: ITransaction) => ({
            value: income.amount,
            name: income.category,
          })),
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
  }

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

  // BAR CHART
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
    const allMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    if (this.selectedTime === 'week') {
      // (this.barChartOption.xAxis as any).data = [
      //   'Week 1',
      //   'Week 2',
      //   'Week 3',
      //   'Week 4',
      // ];
      // (this.barChartOption.series as any)[0].data = [150, 200, 250, 300];
      // (this.barChartOption.series as any)[1].data = [100, 150, 200, 250];

      const allWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weeklyIncomeData: number[] = new Array(5).fill(0);
      const weeklyExpenseData: number[] = new Array(5).fill(0);

      this.transactionBudgetService.GetAllTransactions(this.userID).subscribe({
        next: (expense: ITransaction[]) => {
          expense.forEach((transaction: ITransaction) => {
            const date = new Date(transaction.date);
            const weekIndex = this.getWeekNumber(date) - 1;

            console.log(weekIndex);

            weeklyExpenseData[weekIndex] += transaction.amount;
          });

          this.transactionBudgetService.GetAllIncome(this.userID).subscribe({
            next: (income: IIncome[]) => {
              income.forEach((income: IIncome) => {
                const date = new Date(income.date);
                const weekIndex = this.getWeekNumber(date) - 1;

                weeklyIncomeData[weekIndex] += income.amount;
              });

              this.updateBarChartData(
                'week',
                weeklyIncomeData,
                weeklyExpenseData,
                allWeeks
              );
            },
            error: (err) => this.toastr.error(err.error.error, 'Error'),
          });
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
    } else {
      const monthlyIncomeData: number[] = new Array(12).fill(0);
      const monthlyExpenseData: number[] = new Array(12).fill(0);

      // FETCHING TRANSACTIONS
      this.transactionBudgetService.GetAllTransactions(this.userID).subscribe({
        next: (expense: ITransaction[]) => {
          // PROCESSING TRANSACTION DATA
          expense.forEach((transaction: ITransaction) => {
            const date = new Date(transaction.date);
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            monthlyExpenseData[monthIndex] += transaction.amount;
          });

          // FETCHING INCOME
          this.transactionBudgetService.GetAllIncome(this.userID).subscribe({
            next: (inc: IIncome[]) => {
              // PROCESSING INCOME DATA
              inc.forEach((income: IIncome) => {
                const date = new Date(income.date);
                const monthIndex = date.getMonth();
                const year = date.getFullYear();
                monthlyIncomeData[monthIndex] += income.amount;
              });

              // UPDATING CHART
              this.updateBarChartData(
                'month',
                monthlyIncomeData,
                monthlyExpenseData,
                allMonths
              );
            },
            error: (err) =>
              this.toastr.error(err.error.error, 'Error fetching income data'),
          });
        },
        error: (err) =>
          this.toastr.error(err.error.error, 'Error fetching transaction data'),
      });
    }

    this.barChartOption = { ...this.barChartOption };
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
  }

  filterTransactionsByMonth(
    transactionList: any[],
    monthIndex: number,
    year: number
  ): any[] {
    return transactionList.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      return transactionMonth === monthIndex && transactionYear === year;
    });
  }

  updateBarChartData(
    timeframe: string,
    incomeData: number[],
    expenseData: number[],
    xAxisLabels: string[]
  ) {
    (this.barChartOption.xAxis as any).data = xAxisLabels;
    (this.barChartOption.series as any)[0].data = incomeData;
    (this.barChartOption.series as any)[1].data = expenseData;

    this.barChartOption = { ...this.barChartOption };
  }
}
