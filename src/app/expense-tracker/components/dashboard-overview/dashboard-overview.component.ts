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
  @ViewChild('textSection') textSection!: ElementRef; // WELCOME ADMIN TEXT

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

  transactionForBarChart: ITransaction[] = [];
  incomeForBarChart: IIncome[] = [];

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

        this.getAllTransactionsForBarChart();
      }
    });

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

  // WELCOME ADMIN TEXT ANIMATION
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

  getAllTransactionsForBarChart() {
    // FETCHING TRANSACTIONS
    this.transactionBudgetService.GetAllTransactions(this.userID).subscribe({
      next: (expense: ITransaction[]) => {
        this.transactionForBarChart = expense;
        // FETCHING INCOME
        this.transactionBudgetService.GetAllIncome(this.userID).subscribe({
          next: (income: IIncome[]) => {
            this.incomeForBarChart = income;
            this.updateBarChart();
          },
        });
      },
    });
  }

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
      const allWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const monthlyIncomeData: number[] = new Array(5).fill(0);
      const monthlyExpenseData: number[] = new Array(5).fill(0);

      // CURRENT MONTH AND YEAR
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      this.transactionForBarChart.forEach((transaction: ITransaction) => {
        const dateString = transaction.date;
        const [year, month, day] = dateString
          .split('T')[0]
          .split('-')
          .map(Number);
        const date = new Date(Date.UTC(year, month - 1, day)); // CONVERTING TO UTC TO GET THE CORRECT DATE FROM MONGO, OTHERIWISE ADDS (GMT+0600)
        const monthIndex = date.getMonth();
        const yearMap = date.getFullYear();

        // FILTER TO INCLUDE ONLY TRANSACTIONS FROM THE CURRENT MONTH AND YEAR
        if (monthIndex === currentMonth && yearMap === currentYear) {
          const weekIndex = this.getWeekOfMonth(date) - 1;
          if (weekIndex >= 0 && weekIndex < 5)
            monthlyExpenseData[weekIndex] += transaction.amount;
        }
      });

      this.incomeForBarChart.forEach((income: IIncome) => {
        const dateString = income.date;
        const [year, month, day] = dateString
          .split('T')[0]
          .split('-')
          .map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        const monthIndex = date.getMonth();
        const yearMap = date.getFullYear();

        // FILTER TO INCLUDE ONLY INCOMES FROM THE CURRENT MONTH AND YEAR
        if (monthIndex === currentMonth && yearMap === currentYear) {
          const weekIndex = this.getWeekOfMonth(date) - 1;
          if (weekIndex >= 0 && weekIndex < 5)
            monthlyIncomeData[weekIndex] += income.amount;
        }
      });

      this.updateBarChartData(monthlyIncomeData, monthlyExpenseData, allWeeks);
    } else {
      const monthlyIncomeData: number[] = new Array(12).fill(0);
      const monthlyExpenseData: number[] = new Array(12).fill(0);
      // PROCESSING TRANSACTION DATA
      this.transactionForBarChart.forEach((transaction: ITransaction) => {
        const date = new Date(transaction.date);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        monthlyExpenseData[monthIndex] += transaction.amount;
      });

      // PROCESSING INCOME DATA
      this.incomeForBarChart.forEach((income: IIncome) => {
        const date = new Date(income.date);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        monthlyIncomeData[monthIndex] += income.amount;
      });

      // UPDATING CHART
      this.updateBarChartData(monthlyIncomeData, monthlyExpenseData, allMonths);
    }

    this.barChartOption = { ...this.barChartOption };
  }

  getWeekOfMonth(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
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
