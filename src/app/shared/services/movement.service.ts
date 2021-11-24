import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { CONSTANTS } from '../libraries/constants';

@Injectable({
  providedIn: 'root'
})
export class MovementService extends CONSTANTS implements OnInit {

  public movementEmitters: EventEmitter<{dir: string, movement: number}>[][] = [];
  public zSetEmitters: EventEmitter<number>[][] = [];

  ngOnInit(): void {

    for (let y = 0; y < this.CONSTS.board.height; y++) {
      this.movementEmitters[y] = [];
      this.zSetEmitters[y] = [];

      for (let x = 0; x < this.CONSTS.board.width; x++) {
        this.movementEmitters[y][x] = new EventEmitter();
        this.zSetEmitters[y][x] = new EventEmitter();
      }
    }
  }

  sendAnimationToDirective(dir: string, movement: number, index: {y: number, x: number}) {
    this.movementEmitters[index.y][index.x].emit({dir: dir, movement: movement});
  }

  sendZIndexToDirective(z: number, i: {y: number, x: number}) {
    this.zSetEmitters[i.y][i.x].emit(z);
  }

  constructor() {
    super();
    this.ngOnInit();
  }
}
