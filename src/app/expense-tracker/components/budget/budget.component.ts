import { Component, effect, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { EChartsOption } from 'echarts';

import { IBudget } from '../../../interfaces/TransactionBudget.interface';

import { TransactionBudgetService } from '../../services/transaction-budget.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: [
    './budget.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class BudgetComponent implements OnInit {
  @ViewChild('BudgetGrid') BudgetGrid!: jqxGridComponent;

  userID: string | null = '';

  budgetForm: FormGroup = new FormGroup({});
  budgets: IBudget[] = [];
  budgetColumn: any[] = [];
  actualSpending: { [key: string]: number } = {};

  budgetSource: any = {
    localdata: this.budgets,
    datatype: 'array',
    datafields: [
      { name: 'category', type: 'string' },
      { name: 'budget', type: 'number' },
      { name: 'date', type: 'string' },
      { name: 'actualSpending', type: 'number' },
    ],
  };
  dataAdapter: any;

  constructor(
    private fb: FormBuilder,
    private transactionBudgetService: TransactionBudgetService,
    private authService: AuthenticationService,
    private datepipe: DatePipe,
    private toastr: ToastrService
  ) {}

  loadBudgets() {
    const year = new Date(this.budgetForm.value.date).getFullYear();
    const month = new Date(this.budgetForm.value.date).getMonth() + 1;

    this.transactionBudgetService
      .GetAllBudgets(this.userID, year, month)
      .subscribe({
        next: (data) => {
          if (data.length <= 0)
            this.toastr.info('No budget was found for this user');

          this.budgets = data.map((item: IBudget) => ({
            category: item.category,
            budget: item.budget,
            date: this.datepipe.transform(item.date, '01-MMM-yyyy'),
            actualSpending: item.actualSpending,
          }));

          this.budgetSource.localdata = this.budgets;
          this.dataAdapter = new jqx.dataAdapter(this.budgetSource);
          this.BudgetGrid.updatebounddata();
          this.updateChart();
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
  }

  ngOnInit(): void {
    this.budgetForm = this.fb.group({
      category: ['', [Validators.required]],
      budget: [0, Validators.required],
      date: [new Date(), Validators.required],
    });

    this.userID = this.authService.getUserId();

    this.getColumns();
    this.loadBudgets();

    this.dataAdapter = new jqx.dataAdapter(this.budgetSource);
  }

  showFormError(controlName: string) {
    return (
      (this.budgetForm?.get(controlName)?.touched ||
        this.budgetForm?.get(controlName)?.dirty) &&
      !this.budgetForm?.get(controlName)?.valid &&
      this.budgetForm?.get(controlName)?.errors?.['required']
    );
  }

  getColumns() {
    this.budgetColumn = [
      {
        text: 'Category',
        datafield: 'category',
        width: '30%',
        cellsalign: 'center',
        align: 'center',
        cellclassname: this.cellclass,
      },
      {
        text: 'Budget',
        datafield: 'budget',
        width: '22%',
        cellsalign: 'center',
        align: 'center',
        cellclassname: this.cellclass,
      },
      {
        text: 'Month',
        datafield: 'date',
        width: '25%',
        cellsalign: 'center',
        align: 'center',
        cellclassname: this.cellclass,
      },
      {
        text: 'Actual Spending',
        datafield: 'actualSpending',
        width: '23%',
        cellsalign: 'center',
        align: 'center',
        cellclassname: this.cellclass,
      },
    ];
  }

  // HIGHLIGHT ROW WITH RED COLOR IF ACTUAL SPEND IS MORE THAN BUDGET
  cellclass(row: any, column: any, value: any, rowData: any) {
    return rowData.actualSpending > rowData.budget ? 'red' : '';
  }

  updateActualSpending() {
    this.budgets.forEach((budget) => {
      this.actualSpending[budget.category] = 0;
    });
  }

  addToGrid() {
    const newBudget: IBudget = {
      category: this.budgetForm.value.category,
      budget: this.budgetForm.value.budget,
      date: this.datepipe.transform(this.budgetForm.value.date, '01-MMM-yyyy'),
    };

    this.budgets = [newBudget, ...this.budgets];
    this.budgetSource.localdata = this.budgets;
    this.BudgetGrid.updatebounddata();

    this.transactionBudgetService
      .AddBudget(this.budgetForm.value, this.userID)
      .subscribe({
        next: (newBudget) => {
          this.budgets.push(newBudget);
          this.budgetForm.reset();
          this.toastr.success('Successfully added new transaction', 'Success');
        },
        error: () =>
          this.toastr.error('Failed to add new transaction', 'Error'),
      });

    this.budgetForm.reset();
  }
  chartOption: EChartsOption = {};
  updateChart() {
    const categories = this.budgets.map((b) => b.category);
    const budgetValues = this.budgets.map((b) => b.budget);
    const actualValues = this.budgets.map((b) => b.actualSpending);

    // console.log(this.budgets); // DEBUG:

    this.chartOption = {
      title: {
        text: 'Budget vs Actual Spending',
        subtext: 'Horizontal Bar Chart',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: ['Budget', 'Actual Spending'],
        left: 'left',
      },
      xAxis: {
        type: 'value',
        name: 'Amount',
      },
      yAxis: {
        type: 'category',
        data: categories,
      },
      series: [
        {
          name: 'Budget',
          type: 'bar',
          data: budgetValues,
          label: {
            show: true,
            position: 'insideRight',
          },
          itemStyle: {
            color: '#60a5fa',
          },
        },
        {
          name: 'Actual Spending',
          type: 'bar',
          data: actualValues,
          label: {
            show: true,
            position: 'insideRight',
          },
          itemStyle: {
            color: (params: any) => {
              const spending = actualValues[params.dataIndex];
              const budget = budgetValues[params.dataIndex];
              return spending && spending > budget ? '#fdacb0' : '#14b8a6';
            },
          },
        },
      ],
    };
  }
}
