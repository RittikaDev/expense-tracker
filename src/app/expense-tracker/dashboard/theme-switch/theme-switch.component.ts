import { Component } from '@angular/core';
import {
  ITheme,
  theme$,
  updateThemeState,
} from '../../../interfaces/theme-switch';

@Component({
  selector: 'app-theme-switch',
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.scss',
})
export class ThemeSwitchComponent {
  public theme: ITheme = 'dark';
  constructor() {}

  ngOnInit() {
    theme$.subscribe((theme) => {
      this.theme = theme;
      console.log(theme);
    });
  }

  handleThemeChange() {
    updateThemeState(this.theme === 'dark' ? 'light' : 'dark');
  }
}
