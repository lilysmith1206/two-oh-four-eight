import { Component, HostListener, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../shared/board.service';
import { Tile } from '../shared/tile.template';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  //  stores creates local instance of 2d tile array (board)
  tileBoard: Tile[][] = [];
  tiles: Tile[];

  swipeMoved = false;

  tileListener: Subscription;
  mouseDown = false;

  inPlay: boolean = true;

  constructor(private boardService: BoardService) {
  }

  addTile() {
    this.boardService.addTile();
  }

  movement($event: KeyboardEvent) {
    this.boardService.moveTiles($event.key);
    this.inPlay = this.boardService.userHasMoves();
  }

  restartGame() {
    this.boardService.gameHasMoves.emit(true);
    if (this.tileListener) {
      this.tileListener.unsubscribe();
    }

    this.tileListener = this.boardService.tileUpdateEmitter.subscribe( (board) => {
      this.tileBoard = board;
      this.tiles = this.tileBoard.reduce( (prev, accum) => prev.concat(accum));
    });

    if (window.localStorage.getItem('restore_data') === 'true') {
      let game: {isEmpty: boolean, isNew: boolean, hasMerged: boolean, value: number}[][] = JSON.parse(window.localStorage.getItem('game'));

      for (let y = 0; y < 4; y++) {
        this.tileBoard[y] = [];
        for (let x = 0; x < 4; x++) {
          this.tileBoard[y][x] = new Tile(game[y][x].isEmpty, game[y][x].value);
          this.tileBoard[y][x].hasMerged = game[y][x].hasMerged;
          this.tileBoard[y][x].isNew = false;
        }
      }
      // console.log(this.tileBoard.map(row => row.map(tile => tile.value)));
      this.boardService.setBoard(this.tileBoard);

      window.localStorage.setItem('restore_data', 'false');
    }

    else {
      this.boardService.createBoard(Math.ceil(Math.random()*3));
    }

    this.boardService.gameLost = false;
    this.inPlay = true;
    if (window.localStorage.getItem('score')) {
      this.boardService.scoreValue = Number(window.localStorage.getItem('score'));
      window.localStorage.setItem('score', '0');
    }
    else {
    this.boardService.scoreValue = 0;
    }
  }

  onMouseDown() {
    this.mouseDown = true;
  }

  onMouseUp() {
    this.mouseDown = false;
  }

  onMouseMove($event: MouseEvent) {
    $event.preventDefault();
    const mouseMovements = {x: $event.movementX / 2, y: $event.movementY / 2};

    if (this.mouseDown && !this.swipeMoved && Math.abs(mouseMovements.x) >= 1 && Math.abs(mouseMovements.y) >= 1) {
      if (Math.abs(mouseMovements.x) === Math.abs(mouseMovements.y)) {
        return;
      }

      this.swipeMoved = true;

      setTimeout( () => this.swipeMoved = false, 500);
      if (Math.abs(mouseMovements.x) > Math.abs(mouseMovements.y)) {
        // goes left or right
        if (Math.sign(mouseMovements.x) > 0) {
          this.boardService.moveTiles('right');
        }
        else if (Math.sign(mouseMovements.x) < 0) {
          this.boardService.moveTiles('left');
        }
      }
      else {
        // goes up or down
        if (Math.sign(mouseMovements.y) > 0) {
          this.boardService.moveTiles('down');
        }
        else if (Math.sign(mouseMovements.y) < 0) {
          this.boardService.moveTiles('up');
        }
      }
    }
  }

  focusDiv() {
    document.getElementById('game-container').focus();
  }

  ngOnInit(): void {
    this.restartGame();
  }

  mobileMove(dir: string) {
    this.boardService.moveTiles(dir);
    this.inPlay = this.boardService.userHasMoves();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    window.localStorage.setItem('game', JSON.stringify(this.tileBoard));
    window.localStorage.setItem('restore_data', 'true');
  }

}
