import { Component, EventEmitter, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../shared/services/board.service';
import { Tile } from '../shared/templates/tile.template';
import { constants } from '../shared/libraries/constants';
import { ThemeService } from '../shared/services/theme.service';
import * as Hammer from '../shared/libraries/hammer.min.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit, OnDestroy {
  tileBoard: Tile[][] = [];
  tiles: Tile[];
  isLightMode: boolean = true;
  swipeMoved = false;

  tileListener: Subscription;
  mouseDown = false;

  inPlay: boolean = true;

  constructor(private boardService: BoardService, private themeService: ThemeService) {
    document.getElementsByTagName('body')[0].classList.add('light');

    this.tileListener = this.boardService.boardUpdateEmitter.subscribe( (board) => {
      this.tileBoard = board;
      this.tiles = this.tileBoard.reduce((prev, accum) => prev.concat(accum));
    });
  }

  ngOnInit(): void {
    this.setUpMobileInterface();
    this.restartGame();
  }

  setUpMobileInterface() {
    const hammertime = new Hammer(document.getElementById('game-container'), [Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }]);

    hammertime.get('swipe').set({direction: Hammer.DIRECTION_ALL});

    const v = hammertime.on('swipe', (ev) => { this.getDirectionFromMobile(ev) });
  }

  componentRef = this;

  getDirectionFromMobile(ev) {
      let movement = '';

      switch (ev.direction) {
        case 8: movement = 'up'; break;
        case 2: movement = 'left'; break;
        case 16: movement = 'down'; break;
        case 4: movement = 'right'; break;
      }

      this.boardService.inputMovementToBoard(movement);
    }
  ngOnDestroy(): void {
    this.tileListener.unsubscribe();
  }


  addTile() {
    this.boardService.addTile();
  }

  movement(key: KeyboardEvent) {
    this.boardService.inputMovementToBoard(key.key);
    this.inPlay = this.boardService.isBoardMovable();
  }

  restartGame() {

    let game: {
      isEmpty:   boolean,
      isNew:     boolean,
      hasMerged: boolean,
      value:     number
    }[][] = JSON.parse(window.localStorage.getItem('game'));
    
    if (window.localStorage.getItem('restore_data') === 'true'
     && constants.board.width == game[0]?.length
     && constants.board.height == game.length) {

      for (let y = 0; y < constants.board.height; y++) {
        this.tileBoard[y] = [];
        for (let x = 0; x < constants.board.width; x++) {
          this.tileBoard[y][x] = new Tile(game[y][x].isEmpty, game[y][x].value);
          this.tileBoard[y][x].hasMerged = game[y][x].hasMerged;
          this.tileBoard[y][x].isNew = false;
        }
      }

      this.boardService.setBoard(this.tileBoard);

      this.inPlay = this.boardService.isBoardMovable();

      window.localStorage.setItem('restore_data', 'false');
    }

    else {
      this.boardService.startGame();
      this.inPlay = true;
    }
    this.focusGame();
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

  focusGame() {
    document.getElementById('game-container').focus();
  }

  mobileMove(dir: string) {
    this.boardService.inputMovementToBoard(dir);
    this.inPlay = this.boardService.isBoardMovable();
  }

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    window.localStorage.setItem('game', JSON.stringify(this.tileBoard));
    window.localStorage.setItem('restore_data', 'true');
  }
}
