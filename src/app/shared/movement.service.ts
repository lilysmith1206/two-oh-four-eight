import { EventEmitter, Injectable, OnInit } from '@angular/core';
import * as transition from './transition.min.js'

@Injectable({
  providedIn: 'root'
})
export class SharedService implements OnInit {

  public emitters: EventEmitter<any>[][];

  ngOnInit(): void {

  }

  sendAnimationToDirectives(movement: {dir: string, length: number}, index: {y: number, x: number}) {


  }

  constructor() { }
}
