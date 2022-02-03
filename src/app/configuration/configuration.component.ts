import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  width = 40;
  height = 40;

  test(event: MatSliderChange) {
  }

  constructor() {}

  ngOnInit(): void {
  }

}
