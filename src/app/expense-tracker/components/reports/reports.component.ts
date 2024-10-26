import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '../../services/authentication.service';
import { TransactionBudgetService } from '../../services/transaction-budget.service';

import { ITransaction } from '../../../interfaces/TransactionBudget.interface';

import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { ToastrService } from 'ngx-toastr';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { ITheme, theme$ } from '../../../interfaces/theme-switch';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: [
    './reports.component.scss',
    '../../authentication/login/login.component.scss',
    '../transactions/transactions.component.scss',
  ],
})
export class ReportsComponent implements OnInit {
  @ViewChild('ReportsGrid') ReportsGrid!: jqxGridComponent;

  theme: ITheme = 'dark';

  reportForm: FormGroup = new FormGroup({});

  source: ITransaction[] = [];
  column: any[] = [];
  transactionSource: any = {
    localdata: this.source,
    datatype: 'array',
    datafields: [
      { name: 'category', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'date' },
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

  ngOnInit(): void {
    theme$.subscribe((theme) => (this.theme = theme));

    this.reportForm = this.fb.group({
      date: [new Date(), Validators.required],
    });
  }

  selectedDate() {
    this.authService.userId$.subscribe((userId) => {
      if (userId) {
        const year = new Date(this.reportForm.value.date).getFullYear();
        const month = new Date(this.reportForm.value.date).getMonth() + 1;
        this.getColumns();

        this.transactionBudgetService
          .GetTransactionMonthWise(userId, year, month)
          .subscribe({
            next: (data) => {
              if (data.length <= 0)
                this.toastr.info(
                  'No transaction was found for this user of current month'
                );
              this.source = data.map((item: ITransaction) => ({
                category: item.category,
                date: item.date,
                amount: item.amount,
                status: item.status,
              }));
              this.transactionSource.localdata = this.source;
              this.dataAdapter = new jqx.dataAdapter(this.transactionSource);
            },
            error: (err) => this.toastr.error(err.error.error, 'Error'),
          });
      }
    });
  }

  getColumns() {
    this.column = [
      {
        text: 'Category',
        datafield: 'category',
        width: '45%',
        cellsalign: 'center',
        align: 'center',
      },
      {
        text: 'Amount',
        datafield: 'amount',
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

  excelCellMerge(worksheet: any, title: any) {
    worksheet.mergeCells(`A${title.number}:C${title.number}`);
    title.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  }
  excelCellAllignment(cell: any) {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  }

  downloadExcel() {
    if (this.source.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      const title = worksheet.addRow(['Expense Report']); // TITLE ON TOP
      title.font = { bold: true, size: 16 };
      this.excelCellMerge(worksheet, title);
      worksheet.addRow([]);

      const userName = sessionStorage.getItem('displayName');
      const userEmail = sessionStorage.getItem('email');

      const nameRow = worksheet.addRow([`Name: ${userName}`]);
      this.excelCellMerge(worksheet, nameRow);

      const emailRow = worksheet.addRow([`Email: ${userEmail}`]);
      this.excelCellMerge(worksheet, emailRow);

      const reportRow = worksheet.addRow(['Report Analysis']);
      this.excelCellMerge(worksheet, reportRow);

      worksheet.addRow([]);

      // MANUALLY ADDING TABLE HEADERS AS ROW
      const headerRow = worksheet.addRow(['Category', 'Amount', 'Date']);

      // Set custom column widths
      worksheet.getColumn(1).width = 35; // WIDTH FOR Category
      worksheet.getColumn(2).width = 20; // WIDTH FOR Amount
      worksheet.getColumn(3).width = 30; // WIDTH FOR Date

      headerRow.eachCell((cell, colNumber) => {
        if (colNumber <= 3) {
          cell.font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F81BD' },
          };
          this.excelCellAllignment(cell);
        }
      });

      this.source.forEach((item) => {
        worksheet.addRow([
          item.category,
          item.amount,
          this.formatDate(item.date),
        ]);
      });

      // APPLY STYLING TO FIRST THREE COLUMNS ONLY
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > headerRow.number) {
          // STYLE ONLY ROWS BELOW THE HEADER
          row.eachCell((cell, colNumber) => {
            if (colNumber <= 3) {
              cell.font = { size: 14, color: { argb: '000000' } };
              this.excelCellAllignment(cell);
            }
          });
        }
      });

      // SAVE THE EXCEL FILE
      workbook.xlsx
        .writeBuffer()
        .then((buffer) => this.saveAsExcelFile(buffer, 'ExportExcel'));
    }
  }

  // DOWNLOAD EXCEL FILE
  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  // PDF GENERATION
  generatePdf(): void {
    const displayName = sessionStorage.getItem('displayName');
    const email = sessionStorage.getItem('email');

    // PREPARING DATA FOR TABLE
    const tableData = this.source.map((item) => [
      item.category,
      item.amount,
      this.formatDate(item.date),
    ]);

    const documentDefinition = {
      content: [
        {
          text: 'Expense Report',
          style: 'header',
          alignment: 'center', // HEADER TEXT
        },
        {
          text: [
            { text: `Name: `, bold: true },
            `${displayName}\n`,
            { text: `Email: `, bold: true },
            `${email}\n`,
            { text: `Date: `, bold: true },
            `${this.formatDate(new Date().toString())}\n`,
            { text: `Total Amount: `, bold: true },
            `${this.getTotalAmount()}\n`,
          ],
          style: 'userInfo',
          alignment: 'left',
          margin: [0, 10, 0, 20],
        },
        {
          style: 'tableExample',
          alignment: 'center',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Category', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' },
                { text: 'Date', style: 'tableHeader' },
              ],
              ...tableData,
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 20], // [left, top, right, bottom]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'white',
          fillColor: '#4F81BD', // HEADER BACKGROUND COLOR
          alignment: 'center',
        },
        tableExample: {
          margin: [0, 5, 0, 15],
          fontSize: 10,
          alignment: 'center',
          border: [true, true, true, true], // ENABLE BORDER
        },
        summary: {
          bold: true,
          fontSize: 12,
        },
      },
      defaultStyle: {
        alignment: 'center', // CENTER CONTENT BY DEFAULT
      },
    };

    // CRAETE THE PDF
    pdfMake.createPdf(documentDefinition).download('expense_report.pdf');
  }

  // FORMATTING DATE
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }

  // FUNCTION TO CALCULATE TOTAL AMOUNT
  getTotalAmount(): number {
    return this.source.reduce((acc, item) => acc + item.amount, 0);
  }
}
