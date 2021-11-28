import { Component, Input, Output } from '@angular/core';
import { BoardService } from './shared/services/board.service';
import { ThemeHandlerService } from './shared/services/theme-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  fontColour: string = '#000';


  constructor(private themeHandlerService: ThemeHandlerService) {

  }

  themeHandler(theme) {
    this.themeHandlerService.themeHandler(theme.value);

    switch (theme.value) {
      case 'dark':
        document.getElementsByTagName('body')[0].classList.replace('light', 'dark');
        this.fontColour = '#FFF';
      break;
      case 'light':
        document.getElementsByTagName('body')[0].classList.replace('dark', 'light');
        this.fontColour = '#000';
      break;
    }
  }
  // title = 'two-oh-four-eight';
}
