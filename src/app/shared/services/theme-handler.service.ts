import { EventEmitter, Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeHandlerService implements OnInit {

  themeUpdated: EventEmitter<string>;
  constructor() {
    this.ngOnInit();
   }

  ngOnInit(): void {
    this.themeUpdated = new EventEmitter();
  }

  themeHandler(theme: string) {
    this.themeUpdated.emit(theme);
  }
}
