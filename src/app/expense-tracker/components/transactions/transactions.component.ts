import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { ITransaction } from '../../../interfaces/TransactionBudget.interface';
import { TransactionBudgetService } from '../../services/transaction-budget.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';
import { ITheme, theme$ } from '../../../interfaces/theme-switch';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: [
    './transactions.component.scss',
    '../../authentication/login/login.component.scss',
    '../transactions/transactions.component.scss',
  ],
})
export class TransactionsComponent implements OnInit {
  @ViewChild('TransactionGrid') TransactionGrid!: jqxGridComponent;

  theme: ITheme = 'dark';

  userID: string | null = '';

  transactionForm: FormGroup = new FormGroup({});

  totalIncome: number = 1500;
  totalExpense: number = 0;
  totalAmount: number = 0;

  isSaveButtonDisabled: boolean = true;

  status = ['Success', 'Cancel'];

  arrayToSelectNewRows: ITransaction[] = [];

  column: any[] = [];

  source: ITransaction[] = [];

  transactionSource: any = {
    localdata: this.source,
    datatype: 'array',
    datafields: [
      { name: 'category', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'date' },
      { name: 'status', type: 'string' },
    ],
  };

  dataAdapter: any;

  ngOnInit(): void {
    theme$.subscribe((theme) => (this.theme = theme));

    this.userID = this.authService.getUserId();
    this.authService.userId$.subscribe((userId) => {
      if (userId) {
        this.userID = userId;
        this.getColumns();
        this.loadTransactions();
        this.dataAdapter = new jqx.dataAdapter(this.transactionSource);
      }
    });

    this.transactionForm = this.fb.group({
      category: ['', [Validators.required]],
      amount: [0, Validators.required],
      date: ['', Validators.required],
    });
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datepipe: DatePipe,
    private transactionBudgetService: TransactionBudgetService,
    private authService: AuthenticationService
  ) {}

  loadTransactions() {
    this.transactionBudgetService.GetAllTransactions(this.userID).subscribe({
      next: (data) => {
        if (data.length <= 0)
          this.toastr.info('No transaction was found for this user');

        this.source = data;

        this.source.map((data: ITransaction) => {
          if (data.status === 'Success') this.totalExpense += data.amount;
        });

        this.totalAmount = this.totalIncome - this.totalExpense;

        this.transactionSource.localdata = this.source;
        this.dataAdapter = new jqx.dataAdapter(this.source);
        this.TransactionGrid.updatebounddata();
      },
      error: (err) => this.toastr.error(err.error.error, 'Error'),
    });
  }

  getColumns() {
    this.column = [
      {
        text: 'Category',
        datafield: 'category',
        width: '33%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Amount',
        datafield: 'amount',
        width: '25%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Date',
        datafield: 'date',
        width: '25%',
        cellsformat: 'dd-MMM-yyyy',
        cellsalign: 'center',
        align: 'center',
        filtertype: 'date',
      },
      {
        text: 'Status',
        datafield: 'status',
        width: '15%',
        cellsalign: 'center',
        align: 'center',
        cellbeginedit: this.cellbeginedit.bind(this),
        cellendedit: this.cellendedit.bind(this),
        columntype: 'combobox',
        initeditor: (row: number, cellvalue: string, editor: any) => {
          editor.jqxComboBox({
            autoDropDownHeight: true,
            source: this.status,
          });

          if (cellvalue) {
            const index = this.status.findIndex((val) => val === cellvalue);
            if (index >= 0) editor.jqxComboBox('selectIndex', index);
          }
        },
        validation: (cell: any, value: string) => {
          if (value == '') {
            this.isSaveButtonDisabled = true;
            return { result: false, message: 'Status can not be null' };
          }
          this.isSaveButtonDisabled = false;
          return true;
        },
      },
    ];
  }

  // DROPDOWN WILL ONLY WORK IF ROW IS CHECKED
  cellbeginedit(row: number, datafield: any): boolean {
    return this.TransactionGrid.getselectedrowindexes().includes(row);
  }

  cellendedit(
    row: number,
    datafield: string,
    columntype: string,
    oldvalue: string,
    newvalue: string
  ) {
    const rowData = this.TransactionGrid.getrowdata(row);
    const amount = rowData.amount;

    if (oldvalue !== newvalue) {
      if (newvalue === 'Success') this.updateTotal(amount, 'add');
      if (newvalue === 'Cancel') this.updateTotal(amount, 'subtract');
    }

    // CHECKS IF TOTAL EXPENSE EXCEEDS TOTAL INCOME
    if (this.totalExpense > this.totalIncome) {
      this.toastr.warning(
        'Total expense cannot exceed total income.',
        'Warning'
      );
      setTimeout(() => {
        this.TransactionGrid.setcellvalue(row, 'status', oldvalue);
        this.TransactionGrid.refreshdata();
        this.updateTotal(amount, 'subtract');
      }, 100);
    } else this.totalAmount = this.totalIncome - this.totalExpense;
  }

  updateTotal(amount: number, action: 'add' | 'subtract') {
    if (action === 'add') this.totalExpense += amount;
    else if (action === 'subtract') this.totalExpense -= amount;
  }

  // ADDING NEW ROW TO GRID
  addToGrid() {
    const newTransaction: ITransaction = {
      category: this.transactionForm.value.category,
      amount: this.transactionForm.value.amount,
      date: this.datepipe.transform(
        this.transactionForm.value.date,
        'dd-MMM-yyyy'
      ),
      status: 'Success',
    };

    const date = new Date(this.transactionForm.value.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    this.transactionBudgetService
      .CheckBudgetForCategory(
        this.userID,
        newTransaction.category,
        newTransaction.amount,
        year,
        month
      )
      .subscribe({
        next: (res: any) => this.toastr.success(res.message, 'Success'),
        error: (err) => this.toastr.warning(err.error.error, 'Warning'),
      });

    this.source = [newTransaction, ...this.source];
    this.arrayToSelectNewRows.push(newTransaction);

    this.totalExpense += newTransaction.amount;

    this.transactionSource.localdata = this.source;
    this.TransactionGrid.updatebounddata();

    this.arrayToSelectNewRows.map((newRow: ITransaction, index: number) =>
      this.TransactionGrid.selectrow(index)
    );

    this.transactionForm.reset({ amount: 0, date: '', category: '' });
    this.isSaveButtonDisabled = false;
  }

  // FINAL SAVE
  saveGridData() {
    this.spinner.show();
    const rowsToSave = this.TransactionGrid.getselectedrowindexes().map(
      (index) => this.source[index]
    );

    this.transactionBudgetService
      .AddTransaction(this.userID, rowsToSave)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res) => {
          this.source.push(res);
          this.transactionForm.reset({
            amount: 0,
            date: '',
            category: '',
          });
          this.isSaveButtonDisabled = false;
          this.toastr.success('Successfully added a budget', 'Success');
        },
        error: () => this.toastr.error('Failed to add a budget', 'Error'),
      });
  }
}
