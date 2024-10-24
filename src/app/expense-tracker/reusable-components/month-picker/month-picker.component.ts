import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { CustomDateAdapter } from '../../utilities/CustomDateAdapter';

export const MY_FORMATS = {
  parse: { dateInput: 'MMMM/YYYY' },
  display: {
    dateInput: 'MMMM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class MonthPickerComponent {
  @Input() placeholder: string = '';
  @Input() controlName!: Date | any;
  @Input() formName!: FormGroup;

  @Output() btnClick = new EventEmitter();

  constructor() {}
  ngOnInit(): void {}
  ngOnChanges() {}
  setMonthAndYear(
    normalizedMonthAndYear: Date,
    datepicker: MatDatepicker<Date>
  ): void {
    const ctrlValue = this.formName.get(this.controlName)?.value;
    // USE normalizedMonthAndYear DIRECTLY AS A JAVASCRIPT OBJECT
    const selectedMonth = normalizedMonthAndYear.getMonth();
    const selectedYear = normalizedMonthAndYear.getFullYear();

    const newDate = new Date(ctrlValue);
    newDate.setMonth(selectedMonth);
    newDate.setFullYear(selectedYear);

    this.formName.get(this.controlName)?.setValue(newDate);
    this.btnClick.emit(newDate);
    datepicker.close();
  }
}
