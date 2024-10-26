import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { AuthenticationService } from '../../services/authentication.service';
import { TransactionBudgetService } from '../../services/transaction-budget.service';

import { IIncome } from '../../../interfaces/TransactionBudget.interface';
import { user } from '@angular/fire/auth';
import { ITheme, theme$ } from '../../../interfaces/theme-switch';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: [
    './income.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class IncomeComponent implements OnInit {
  @ViewChild('IncomeGrid') IncomeGrid!: jqxGridComponent;

  theme: ITheme = 'dark';

  userID: string | null = '';

  incomeForm: FormGroup = new FormGroup({});

  income: IIncome[] = [];
  incomeColumn: any[] = [];

  incomeSource: any = {
    localdata: this.income,
    datatype: 'array',
    datafields: [
      { name: 'category', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'string' },
    ],
  };
  dataAdapter: any;

  getColumns() {
    this.incomeColumn = [
      {
        text: 'Category',
        datafield: 'category',
        width: '40%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Amount',
        datafield: 'amount',
        width: '30%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Date',
        datafield: 'date',
        cellsformat: 'dd-MMM-yyyy',
        cellsalign: 'center',
        align: 'center',
        filtertype: 'date',
      },
    ];
  }

  constructor(
    private fb: FormBuilder,
    private transactionBudgetService: TransactionBudgetService,
    private authService: AuthenticationService,
    private datepipe: DatePipe,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    theme$.subscribe((theme) => (this.theme = theme));

    this.authService.userId$.subscribe((userId) => {
      if (userId) {
        this.userID = userId;

        console.log(this.userID);

        this.getColumns();
        this.loadIncomeList();

        this.dataAdapter = new jqx.dataAdapter(this.incomeSource);
      }
    });

    this.incomeForm = this.fb.group({
      category: ['', [Validators.required]],
      amount: [0, Validators.required],
      date: [new Date(), Validators.required],
    });
  }

  loadIncomeList() {
    const year = new Date(this.incomeForm.value.date).getFullYear();
    const month = new Date(this.incomeForm.value.date).getMonth() + 1;

    this.transactionBudgetService
      .GetIncomeList(this.userID, year, month)
      .subscribe({
        next: (data) => {
          if (data.length <= 0)
            this.toastr.info('No income source was found for this user');

          this.income = data.map((item: IIncome) => ({
            category: item.category,
            amount: item.amount,
            date: this.datepipe.transform(item.date, '01-MMM-yyyy'),
          }));

          this.incomeSource.localdata = this.income;
          this.dataAdapter = new jqx.dataAdapter(this.incomeSource);
          this.IncomeGrid.updatebounddata();
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
  }

  addToGrid() {
    this.spinner.show();

    const newIncome: IIncome = {
      category: this.incomeForm.value.category,
      amount: this.incomeForm.value.amount,
      date: this.datepipe.transform(this.incomeForm.value.date, '01-MMM-yyyy'),
    };

    this.income = [newIncome, ...this.income];
    this.incomeSource.localdata = this.income;
    this.IncomeGrid.updatebounddata();

    console.log(this.userID);
    if (this.userID != null)
      this.transactionBudgetService
        .AddIncome(this.userID, newIncome)
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe({
          next: (res) => {
            console.log(res);
            this.incomeForm.reset({
              amount: 0,
              date: new Date(),
              category: '',
            });
            this.toastr.success(
              'Successfully added an income source',
              'Success'
            );
          },
          error: () =>
            this.toastr.error('Failed to add an income source', 'Error'),
        });
  }

  showFormError(controlName: string) {
    return (
      (this.incomeForm?.get(controlName)?.touched ||
        this.incomeForm?.get(controlName)?.dirty) &&
      !this.incomeForm?.get(controlName)?.valid &&
      this.incomeForm?.get(controlName)?.errors?.['required']
    );
  }
}
