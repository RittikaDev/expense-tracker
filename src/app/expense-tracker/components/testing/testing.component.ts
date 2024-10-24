import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ITransaction } from '../../../interfaces/TransactionBudget.interface';
import { AuthenticationService } from '../../services/authentication.service';
import { TransactionBudgetService } from '../../services/transaction-budget.service';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: [
    './testing.component.scss',
    '../transactions/transactions.component.scss',
  ],
})
export class TestingComponent implements OnInit {
  @ViewChild('TransactionGrid', { static: false })
  TransactionGrid!: jqxGridComponent;

  userID: string | null = '';
  transactionForm: FormGroup = new FormGroup({});
  totalIncome: number = 1500;
  totalExpense: number = 0;
  totalAmount: number = 0;
  isSaveButtonDisabled: boolean = true;
  status = ['Success', 'Cancel'];
  arrayToSelectNewRows: ITransaction[] = [];
  column: any[] = [];
  transource: ITransaction[] = [
    {
      transactionId: 1,
      category: 'John',
      amount: 20,
      date: 'Manager',
      status: 'Success',
    },
    {
      transactionId: 2,
      category: 'Jane',
      amount: 30,
      date: 'Engineer',
      status: 'Success',
    },
    {
      transactionId: 3,
      category: 'Michael',
      amount: 44,
      date: 'Developer',
      status: 'Success',
    },
  ];

  // Mock parent data
  source: any = {
    datatype: 'array',
    localdata: this.transource,
    datafields: [
      { name: 'transactionId', type: 'number' },
      { name: 'category', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'string' },
      { name: 'status', type: 'string' },
    ],
  };

  dataAdapter: any = new jqx.dataAdapter(this.source);
  childDataMap = new Map<number, any[]>();
  nestedGrids: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datepipe: DatePipe,
    private transactionBudgetService: TransactionBudgetService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.userID = this.authService.getUserId();

    this.getColumns();
    this.loadTransactions();
    this.dataAdapter = new jqx.dataAdapter(this.transource);

    this.transactionForm = this.fb.group({
      category: ['', [Validators.required]],
      amount: [0, Validators.required],
      date: ['', Validators.required],
    });

    this.transource.map((data: ITransaction) => {
      if (data.status === 'Success') this.totalExpense += data.amount;
    });

    this.totalAmount = this.totalIncome - this.totalExpense;
  }

  ngAfterViewInit() {
    this.bindButtonClicks();
  }

  loadTransactions() {
    this.transactionBudgetService.GetAllTransactions(this.userID).subscribe({
      next: (data) => {
        if (data.length <= 0)
          this.toastr.info('No transaction was found for this user');

        console.log(data);
        this.transource = data;
        console.log(this.transource);
        this.source.localdata = this.transource;
        this.dataAdapter = new jqx.dataAdapter(this.source);
        this.TransactionGrid.updatebounddata('cells');
      },
      error: (err) => this.toastr.error(err.error.error, 'Error'),
    });
  }

  bindButtonClicks() {
    setTimeout(() => {
      document
        .querySelectorAll('.add-child-button')
        .forEach((button, index) => {
          button.addEventListener('click', () => this.addChildRow(index));
        });
    }, 500);
  }

  updateTotal(amount: number, action: 'add' | 'subtract') {
    if (action === 'add') this.totalExpense += amount;
    else if (action === 'subtract') this.totalExpense -= amount;
  }

  initRowDetails = (
    index: any,
    parentElement: any,
    gridElement: any,
    record: any
  ): void => {
    if (parentElement && parentElement.children) {
      let nestedGridContainer = parentElement.children[0];
      this.nestedGrids[index] = nestedGridContainer;

      let childData = this.childDataMap.get(index) || [];
      let ordersSource = {
        datafields: [
          { name: 'transactionId', type: 'number' },
          { name: 'subcategory', type: 'string' },
          { name: 'subamount', type: 'number' },
          { name: 'substatus', type: 'string' },
          { name: 'parentRowIndex', type: 'number' },
        ],
        localdata: childData,
      };
      let nestedGridAdapter = new jqx.dataAdapter(ordersSource);

      if (nestedGridContainer != null) {
        let settings = {
          width: 780,
          height: 200,
          source: nestedGridAdapter,
          editable: true,
          columns: [
            {
              text: 'Sub Category',
              datafield: 'subcategory',
              width: 200,
              editable: true,
              cellendedit: this.editsubcategory.bind(this),
            },
            {
              text: 'Sub Amount',
              datafield: 'subamount',
              width: 200,
              editable: true,
              cellendedit: this.cellendeditforamount.bind(this),
            },
            {
              text: 'Status',
              datafield: 'substatus',
              width: '15%',
              cellsalign: 'center',
              align: 'center',
              columntype: 'combobox',
              cellendedit: this.editsubstatus.bind(this),
              initeditor: (row: number, cellvalue: string, editor: any) => {
                editor.jqxComboBox({
                  autoDropDownHeight: true,
                  source: this.status,
                });
                if (cellvalue) {
                  const index = this.status.findIndex(
                    (val) => val === cellvalue
                  );
                  if (index >= 0) editor.jqxComboBox('selectIndex', index);
                }
              },
              validation: (cell: any, value: string) => {
                if (value == '') {
                  this.isSaveButtonDisabled = true;
                  return { result: false, message: 'Status cannot be null' };
                }
                this.isSaveButtonDisabled = false;
                return true;
              },
            },
          ],
        };
        jqwidgets.createInstance(
          `#${nestedGridContainer.id}`,
          'jqxGrid',
          settings
        );
      }
    } else
      console.warn(
        'Parent element or its children are undefined at index:',
        index
      );
  };

  ready = (): void => {
    this.TransactionGrid.showrowdetails(0);
  };

  getColumns() {
    this.column = [
      {
        text: 'Category',
        datafield: 'category',
        width: '30%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Amount',
        datafield: 'amount',
        width: '20%',
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
        columntype: 'combobox',
        cellbeginedit: this.cellbeginedit.bind(this),
        cellendedit: this.cellendedit.bind(this),
        initeditor: (row: number, cellvalue: string, editor: any) => {
          editor.jqxComboBox({ autoDropDownHeight: true, source: this.status });
          if (cellvalue) {
            const index = this.status.findIndex((val) => val === cellvalue);
            if (index >= 0) editor.jqxComboBox('selectIndex', index);
          }
        },
        validation: (cell: any, value: string) => {
          if (value == '') {
            this.isSaveButtonDisabled = true;
            return { result: false, message: 'Status cannot be null' };
          }
          this.isSaveButtonDisabled = false;
          return true;
        },
      },
      {
        text: 'Add Child',
        width: '8%',
        columntype: 'button',
        cellsrenderer: (): string => {
          return '<button class="add-child-button">Add Child</button>';
        },
      },
    ];
  }

  cellbeginedit(row: number, datafield: any): boolean {
    return this.TransactionGrid.getselectedrowindexes().includes(row);
  }
  editsubcategory(
    row: number,
    datafield: string,
    columntype: string,
    oldvalue: string,
    newvalue: string
  ) {
    if (datafield === 'subcategory') this.childData[row][datafield] = newvalue;
  }
  cellendeditforamount(
    row: number,
    datafield: string,
    columntype: string,
    oldvalue: string,
    newvalue: string
  ) {
    if (datafield === 'subamount') {
      const parentData = this.TransactionGrid.getrowdata(row);
      const childData = this.childData[row] || [];

      childData[datafield] = parseFloat(newvalue);
      childData['substatus'] = 'Success';
    }
  }
  editsubstatus(
    row: number,
    datafield: string,
    columntype: string,
    oldvalue: string,
    newvalue: string
  ) {
    const parentData = this.TransactionGrid.getrowdata(row);
    const childData = this.childData[row];

    const totalChildAmount = this.childData.reduce((sum: any, child: any) => {
      if (sum == undefined) sum = 0;
      if (child['substatus'] == 'Success') return sum + (child.subamount || 0);
    }, 0);

    if (totalChildAmount > parentData.amount) {
      childData['subamount'] = 0;
      childData[datafield] = 'Cancel';
      this.toastr.warning(
        'Total amount of subcategories cannot exceed the parent category amount.',
        'Warning'
      );
      return;
    }
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

    // Check if total expense exceeds total income
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
    } else {
      this.totalAmount = this.totalIncome - this.totalExpense;
    }
  }

  rowdetailstemplate: any = {
    rowdetails: '<div id="nestedGrid" style="margin: 10px;"></div>',
    rowdetailsheight: 220,
    rowdetailshidden: true,
  };

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '90%';
    }
    return 850;
  }
  childData: any[] = [];
  addChildRow(parentRowIndex: number): void {
    this.childData = this.childDataMap.get(parentRowIndex) || [];

    // Add an empty child row
    let newChild: any = {
      transactionId: parentRowIndex,
      subcategory: '', // Empty string for subcategory
      subamount: 0, // Null for subamount
      substatus: '',
    };

    this.childData.push(newChild);
    this.childDataMap.set(parentRowIndex, this.childData);

    this.refreshNestedGrid(parentRowIndex);
  }

  refreshNestedGrid(parentRowIndex: number): void {
    let nestedGrid = this.nestedGrids[parentRowIndex];

    if (nestedGrid) {
      let childData = this.childDataMap.get(parentRowIndex) || [];
      let newSource = {
        datafields: [
          { name: 'transactionId', type: 'number' },
          { name: 'subcategory', type: 'string' },
          { name: 'subamount', type: 'number' },
          { name: 'substatus', type: 'string' },
          { name: 'parentRowIndex', type: 'number' },
        ],
        localdata: childData,
      };

      let nestedGridAdapter = new jqx.dataAdapter(newSource);
      jqwidgets.createInstance(`#${nestedGrid.id}`, 'jqxGrid', {
        source: nestedGridAdapter,
      });
    }
  }

  addToGrid() {
    const newTransaction: ITransaction = {
      transactionId: this.transource.length + 1,
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

    this.transource = [newTransaction, ...this.transource];
    this.arrayToSelectNewRows.push(newTransaction);

    this.totalExpense += newTransaction.amount;

    this.source.localdata = this.transource;
    this.dataAdapter = new jqx.dataAdapter(this.source);
    this.TransactionGrid.updatebounddata();
    this.bindButtonClicks();

    this.transactionForm.reset({ amount: 0, date: '', category: '' });
    this.isSaveButtonDisabled = false;
  }

  saveGridData() {}
}
