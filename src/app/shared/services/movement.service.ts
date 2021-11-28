import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { CONSTANTS } from '../libraries/constants';
import { Dir } from '../templates/board.template';

@Injectable({
  providedIn: 'root'
})
export class MovementService extends CONSTANTS implements OnInit {

  public movementEmitters: EventEmitter<{dir: Dir, movement: string[]}>[][] = [];
  public zSetEmitters: EventEmitter<number>[][] = [];
  public willBeMerged: EventEmitter<any>[][] = [];

  ngOnInit(): void {

    for (let y = 0; y < this.CONSTS.board.height; y++) {
      this.movementEmitters[y] = [];
      this.zSetEmitters[y] = [];
      this.willBeMerged[y] = [];

      for (let x = 0; x < this.CONSTS.board.width; x++) {
        this.movementEmitters[y][x] = new EventEmitter();
        this.zSetEmitters[y][x] = new EventEmitter();
        this.willBeMerged[y][x] = new EventEmitter();
      }
    }
  }

  sendAnimationToDirective(dir: Dir, movement: string[], y: number, x: number) {
    this.movementEmitters[y][x].emit({dir, movement});
  }

  sendZIndexToDirective(z: number, y: number, x: number) {
    this.zSetEmitters[y][x].emit(z);
  }

  sendMergeStatusToDirective(y: number, x: number) {
    this.willBeMerged[y][x].emit();
  }

  constructor() {
    super();
    this.ngOnInit();
  }
}
