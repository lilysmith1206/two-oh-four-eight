import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { CONSTANTS } from '../shared/libraries/constants';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent extends CONSTANTS implements OnInit {

  width = 40;
  height = 40;

  test(event: MatSliderChange) {
    if (event.source._elementRef.nativeElement.id === 'horizontal') {
      // this.width = event.value * 10;
    }
    else {
      // this.height = event.value * 10;
    }
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
