import { HostListener, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Lilac = 'lilac',
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly themeChange: Subject<string> = new Subject();
  currentTheme: Theme = Theme.Light;

  constructor() {
    // this.currentTheme = window.localStorage.getItem('theme') as Theme ?? Theme.Light;
    // this.themeChange.next(this.currentTheme);
  }

  updateTheme(theme: Theme) {
    this.currentTheme = theme;

    // window.localStorage.setItem('theme', theme);

    this.themeChange.next(theme);
  }
}
