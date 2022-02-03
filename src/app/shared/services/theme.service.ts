import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly themeChange: Subject<string> = new Subject();

  constructor() {}

  updateTheme(theme: Theme) {
    this.themeChange.next(theme);
  }
}
