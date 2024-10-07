import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: any): string {
    const days = date.getDate();
    const months = date.toLocaleString('default', { month: 'long' }); // GETTING MONTH NAME INSTEAD OF MONTH NUMBER
    const year = date.getFullYear();
    return months + '/' + year;
  }
}
