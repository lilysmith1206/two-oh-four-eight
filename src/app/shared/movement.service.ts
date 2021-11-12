import { EventEmitter, Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovementService implements OnInit {

  public movementEmitters: EventEmitter<{dir: string, movement: number}>[][] = [];
  public zSetEmitters: EventEmitter<number>[][] = [];

  ngOnInit(): void {

    for (let i = 0; i < 4; i++) {
      this.movementEmitters[i] = [];
      this.zSetEmitters[i] = [];

      for (let j = 0; j < 4; j++) {
        this.movementEmitters[i][j] = new EventEmitter();
        this.zSetEmitters[i][j] = new EventEmitter();
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
    this.ngOnInit();
  }
}
