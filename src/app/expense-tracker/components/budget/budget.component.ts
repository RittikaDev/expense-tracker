import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { EChartsOption } from 'echarts';

import { IBudget } from '../../../interfaces/TransactionBudget.interface';

import { TransactionBudgetService } from '../../services/transaction-budget.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

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
    private datepipe: DatePipe,
    private toastr: ToastrService
  ) {}

  loadBudgets() {
    this.transactionBudgetService.GetAllBudgets().subscribe((data) => {
      this.budgets = data.map((item: IBudget) => ({
        category: item.category,
        budget: item.budget,
        date: this.datepipe.transform(item.date, '01-MMM-yyyy'),
        actualSpending: item.actualSpending,
      }));

      this.budgetSource.localdata = this.budgets;
      this.dataAdapter = new jqx.dataAdapter(this.budgetSource);
      this.BudgetGrid.updatebounddata();
    });
  }

  ngOnInit(): void {
    this.budgetForm = this.fb.group({
      category: ['', [Validators.required]],
      budget: [0, Validators.required],
      date: [0, Validators.required],
    });
    this.getColumns();
    this.loadBudgets();

    this.updateChart();
    this.dataAdapter = new jqx.dataAdapter(this.budgetSource);

    // this.transactionBudgetService.transactions$.subscribe(() =>
    //   this.updateActualSpending()
    // );

    // this.transactionBudgetService.budgets$.subscribe((budgets) => {
    //   this.budgets = budgets;
    //   this.updateActualSpending();
    // });
  }

  setMonthAndYear(
    normalizedMonthAndYear: Date,
    datepicker: MatDatepicker<Date>
  ): void {
    const ctrlValue = this.budgetForm.get('date')?.value;

    // USE normalizedMonthAndYear DIRECTLY AS A JAVASCRIPT OBJECT
    const selectedMonth = normalizedMonthAndYear.getMonth();
    const selectedYear = normalizedMonthAndYear.getFullYear();

    const newDate = new Date(ctrlValue);
    newDate.setMonth(selectedMonth);
    newDate.setFullYear(selectedYear);

    this.budgetForm.get('date')?.setValue(newDate);
    datepicker.close();
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
      },
      {
        text: 'Budget',
        datafield: 'budget',
        width: '22%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Month',
        datafield: 'date',
        width: '25%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Actual Spending',
        datafield: 'actualSpending',
        width: '23%',
        cellsalign: 'center',
        align: 'center',
      },
    ];
  }

  updateActualSpending() {
    this.budgets.forEach((budget) => {
      this.actualSpending[budget.category] =
        this.transactionBudgetService.getActualSpendingForCategory(
          budget.category
        );
      console.log(this.actualSpending);
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

    this.transactionBudgetService.AddBudget(this.budgetForm.value).subscribe({
      next: (newBudget) => {
        this.budgets.push(newBudget);
        this.budgetForm.reset();
        this.toastr.success('Successfully added a budget', 'Success');
      },
      error: () => this.toastr.error('Failed to add a budget', 'Error'),
    });

    // this.transactionBudgetService.addBudget(newBudget);

    this.budgetForm.reset();
  }
  chartOption: EChartsOption = {};
  updateChart() {
    const categories = this.budgets.map((b) => b.category);
    const budgetValues = this.budgets.map((b) => b.budget);
    const actualValues = this.budgets.map((b) => b.actualSpending);
    // const actualValues = categories.map((category) =>
    //   this.transactionBudgetService.getActualSpendingForCategory(category)
    // );

    console.log(actualValues);

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
        },
        {
          name: 'Actual Spending',
          type: 'bar',
          data: actualValues,
          label: {
            show: true,
            position: 'insideRight',
          },
        },
      ],
    };
  }
}
