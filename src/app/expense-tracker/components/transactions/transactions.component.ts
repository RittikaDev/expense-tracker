import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { TransactionGridInterface } from '../../../interfaces/TransactionGrid.interface';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: [
    './transactions.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class TransactionsComponent implements OnInit {
  @ViewChild('TransactionGrid') TransactionGrid!: jqxGridComponent;

  transactionForm: FormGroup = new FormGroup({});

  totalIncome: number = 1500;
  totalExpense: number = 0;
  totalAmount: number = 0;

  isSaveButtonDisabled: boolean = true;

  status = ['Success', 'Cancel'];

  ngOnInit(): void {
    this.getColumns();
    this.dataAdapter = new jqx.dataAdapter(this.transactionSource);

    this.transactionForm = this.fb.group({
      category: ['', [Validators.required]],
      amount: [0, Validators.required],
      date: [''],
    });

    this.source.map((data: TransactionGridInterface) => {
      if (data.status === 'Success') this.totalExpense += data.amount;
    });

    this.totalAmount = this.totalIncome - this.totalExpense;
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  column: any[] = [];
  gridData: any[] = [];
  source: TransactionGridInterface[] = [
    {
      category: 'Groceries',
      amount: 50,
      date: '2024-09-10',
      status: 'Success',
    },
    {
      category: 'Transport',
      amount: 1100,
      date: '2024-09-11',
      status: 'Cancel',
    },
    {
      category: 'Entertainment',
      amount: 100,
      date: '2024-09-12',
      status: 'Success',
    },
    {
      category: 'Utilities',
      amount: 80,
      date: '2024-09-13',
      status: 'Success',
    },
    {
      category: 'Dining',
      amount: 40,
      date: '2024-09-14',
      status: 'Cancel',
    },
    {
      category: 'Health',
      amount: 150,
      date: '2024-09-15',
      status: 'Success',
    },
    {
      category: 'Education',
      amount: 200,
      date: '2024-09-16',
      status: 'Success',
    },
    {
      category: 'Travel',
      amount: 300,
      date: '2024-09-17',
      status: 'Cancel',
    },
  ];

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
        initeditor: (row: number, cellvalue: any, editor: any) => {
          editor.jqxComboBox({
            autoDropDownHeight: true,
            source: this.status,
          });

          if (cellvalue) {
            const index = this.status.findIndex((val) => val === cellvalue);
            if (index >= 0) editor.jqxComboBox('selectIndex', index);
          }
        },
        validation: (cell: any, value: any) => {
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
    oldvalue: any,
    newvalue: any
  ) {
    const rowData = this.TransactionGrid.getrowdata(row);
    const amount = rowData.amount;

    console.log(oldvalue, newvalue);

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
    const newTransaction = {
      category: this.transactionForm.value.category,
      amount: this.transactionForm.value.amount,
      date: this.transactionForm.value.date,
      status: 'Success',
    };
    this.isSaveButtonDisabled = false;
    this.source = [newTransaction, ...this.source];

    this.totalExpense += newTransaction.amount;

    this.transactionSource.localdata = this.source;
    this.TransactionGrid.updatebounddata();

    this.transactionForm.reset({ amount: 0, date: '', category: '' });
  }

  // FINAL SAVE
  saveGridData() {
    this.spinner.show();
    this.spinner.hide();
    this.toastr.success('Data saved successfully', 'Success');
    // this.toastr.error('Failed to save data', 'Error');
  }
}
