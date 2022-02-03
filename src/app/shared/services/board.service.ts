import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { MovementService } from './movement.service';
import { Tile } from '../templates/tile.template';
import { Board } from '../templates/board.template';
import { Subject, Subscription } from 'rxjs';
import { boardStylings, constants } from '../libraries/constants';
import { Theme, ThemeService } from './theme.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class BoardService extends Board {
  theme: Theme = Theme.Light;

  boardUpdateEmitter: EventEmitter<Tile[][]> = new EventEmitter();
  readonly score = new Subject<number>();
  readonly gameActive = new Subject<boolean>();

  constructor(private movementService: MovementService, private themeService: ThemeService) {
    super();

    this.themeService.themeChange.pipe(
      tap((theme: Theme) => {
        this.theme = theme;
      })
    ).subscribe();
  }

  startGame() {
    this.boardUpdateEmitter.emit(this.createStarterBoard(Math.ceil(Math.random()*3)));
  }

  inputMovementToBoard(dir: string) {
    if (this.getDirectionFromPressedKey(dir) !== null && this.inputAllowed) {
      let {scoreToBeAdded, movementRecord, direction} = this.moveTiles(dir);

      this.score.next(scoreToBeAdded);

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const z = ((-this.movementConfiguration[direction].offset.y * y) + 6) + ((-this.movementConfiguration[direction].offset.x * x) + 6);
          this.movementService.sendZIndexToDirective(z, y, x);

          if (movementRecord.hasOwnProperty(y * 4 + x)) {
            this.movementService.sendAnimationToDirective(direction, movementRecord[y * this.height + x], y, x);
          }
        }
      }

      if (!this.isBoardMovable()) {
        this.gameActive.next(false);
      }

      this.inputAllowed = false;
      let arr: string[][] = Object.values(movementRecord);
      let a = Math.max(...arr.map(v => v.length));

      setTimeout( () => {
        this.inputAllowed = true;
        this.boardUpdateEmitter.emit(this.board);

      }, (Number.isFinite(a) ? a : 0) * constants.transitions.length + 50); // maxTimeWaited);
    }
  }

  setBoard(tiles: Tile[][]) {
    this._board = tiles;

    this.boardUpdateEmitter.emit(this.board);
  }

  get colours() {
    return boardStylings[this.theme].slice();
  }
}
