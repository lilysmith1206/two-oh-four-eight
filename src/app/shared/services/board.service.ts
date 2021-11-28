import { EventEmitter, Injectable, OnInit } from "@angular/core";
import { MovementService } from "./movement.service";
import { Tile } from "../templates/tile.template";
import { Board, Dir } from "../templates/board.template";
import { Subscription } from "rxjs";
import { ThemeHandlerService } from "./theme-handler.service";

@Injectable({
  providedIn: 'root'
})

export class BoardService extends Board implements OnInit {

  score: number = 0;
  theme: string = 'light';

  // global consts meant to be available to any component that needs it

  // used to prevent input before animations are completed, it looks weird without this

  // emitter, to control when the board is updated
  themeUpdate: Subscription;

  boardUpdateEmitter: EventEmitter<Tile[][]> = new EventEmitter();
  scoreUpdated = new EventEmitter<number>();
  gameHasMoves = new EventEmitter<boolean>();
  themeUpdated = new EventEmitter();

  constructor(private movementService: MovementService, private themeHandler: ThemeHandlerService) {
    super();
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.themeUpdate = this.themeHandler.themeUpdated.subscribe( (value) => {
      this.theme = value;
      this.themeUpdated.emit();
    });
  }

  startGame() {
    this.boardUpdateEmitter.emit(this.createStarterBoard(Math.ceil(Math.random()*3)));
  }

  inputMovementToBoard(dir: string) {
    if (this.getDirectionFromPressedKey(dir) !== null && this.inputAllowed) {
      let {scoreToBeAdded, movementRecord, direction} = this.moveTiles(dir);

      this.score += scoreToBeAdded;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const z = ((-this.movementConfiguration[direction].offset.y * y) + 6) + ((-this.movementConfiguration[direction].offset.x * x) + 6);
          this.movementService.sendZIndexToDirective(z, y, x);

          if (movementRecord.hasOwnProperty(y * 4 + x)) {
            this.movementService.sendAnimationToDirective(direction, movementRecord[y * this.height + x], y, x);
          }
        }
      }

      if (!this.isBoardMovable) {
        this.gameHasMoves.emit(false);
      }

      this.inputAllowed = false;
      let arr: string[][] = Object.values(movementRecord);
      let a = Math.max(...arr.map(v => v.length));
      // const maxTimeWaited: number = this.CONSTS.transitions.length * Math.max(...Object.values(movementRecord).map(v => v.length));
      setTimeout( () => {
        this.inputAllowed = true;
        this.boardUpdateEmitter.emit(this.board);

      }, (Number.isFinite(a) ? a : 0) * this.CONSTS.transitions.length + 50); // maxTimeWaited);
    }
  }

  setBoard(tiles: Tile[][]) {
    this._board = tiles;

    this.boardUpdateEmitter.emit(this.board);
  }

  addValueScoreboard(value: number) {
    this.score += value;
    this.scoreUpdated.emit(this.score);
  }

  get colours() {
    return this.tileStyles[this.theme].slice();
  }

  get scoreValue() {
    return this.score;
  }

  set scoreValue(scoreVal: number) {
    this.score = scoreVal;
    this.scoreUpdated.emit(this.score);
  }
}
