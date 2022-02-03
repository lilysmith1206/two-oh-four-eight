import { Component, Input, Output } from '@angular/core';
import { Theme, ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ]
})
export class AppComponent {

  fontColour: string = '#000';

  constructor(private themeService: ThemeService) {
    console.log('You probably shouldn\'t be messing around back here.');
    console.log('The save data for the tiles are located in the window\'s localstorage, if you want to mess around.');
    console.log('Don\'t blame me when you break it, though!');
  }

  themeHandler(theme) {
    switch (theme.value) {
      case Theme.Dark:
        document.getElementsByTagName('body')[0].classList.replace('light', 'dark');
        this.fontColour = '#FFF';

        this.themeService.updateTheme(Theme.Dark);
      break;
      case Theme.Light:
        document.getElementsByTagName('body')[0].classList.replace('dark', 'light');
        this.fontColour = '#000';

        this.themeService.updateTheme(Theme.Light);
      break;
    }
  }
  // title = 'two-oh-four-eight';
}
