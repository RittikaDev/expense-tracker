import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../utilities/CustomDateAdapter';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

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
  selector: 'app-month-range-picker',
  templateUrl: './month-range-picker.component.html',
  styleUrl: './month-range-picker.component.scss',
})
export class MonthRangePickerComponent {
  form = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  startMonth: Date | null = null;
  endMonth: Date | null = null;

  // Handle month selection logic for start and end dates
  setMonthAndYear(normalizedMonth: Date, datepicker: MatDatepicker<Date>) {
    if (!this.startMonth) {
      this.startMonth = new Date(
        normalizedMonth.getFullYear(),
        normalizedMonth.getMonth(),
        1
      );
      this.form.get('start')?.setValue(this.startMonth);
    } else if (!this.endMonth || normalizedMonth < this.startMonth) {
      this.endMonth = new Date(
        normalizedMonth.getFullYear(),
        normalizedMonth.getMonth(),
        1
      );
      this.form.get('end')?.setValue(this.endMonth);
      datepicker.close(); // Close datepicker when the end month is selected
    } else {
      // Reset start if selecting a new range
      this.startMonth = new Date(
        normalizedMonth.getFullYear(),
        normalizedMonth.getMonth(),
        1
      );
      this.endMonth = null;
      this.form.get('start')?.setValue(this.startMonth);
      this.form.get('end')?.setValue(null);
    }
  }

  // Reset range
  resetRange() {
    this.startMonth = null;
    this.endMonth = null;
    this.form.reset();
  }
  formatMonthRange(): string {
    if (this.startMonth && this.endMonth) {
      return `${this.formatDate(this.startMonth)} to ${this.formatDate(
        this.endMonth
      )}`;
    } else if (this.startMonth) {
      return `${this.formatDate(this.startMonth)} to ...`;
    } else {
      return ''; // If no months are selected yet, show an empty string.
    }
  }
  formatDate(date: Date | null): string {
    if (!date) return '';
    const options = { year: 'numeric', month: 'short' } as const;
    return date.toLocaleDateString(undefined, options);
  }
}
