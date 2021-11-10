import { Component, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
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
  tileBoard: Tile[][];
  tiles: Tile[];

  tileListener: Subscription;

  inPlay: boolean = true;

  constructor(private boardService: BoardService) {
  }

  addTile() {
    this.boardService.addTile();
  }

  movement($event: KeyboardEvent) {
    this.boardService.moveTiles($event);
    this.inPlay = this.boardService.userHasMoves();
  }

  restartGame() {
    if (this.tileListener) {
      this.tileListener.unsubscribe();
    }

    this.tileListener = this.boardService.tileUpdateEmitter.subscribe( (board) => {
      this.tileBoard = board;
      this.tiles = this.tileBoard.reduce( (prev, accum) => prev.concat(accum));
      console.log(this.tiles);
    });


    this.boardService.createBoard(Math.ceil(Math.random()*3));

    this.boardService.gameLost = false;
    this.inPlay = true;
    this.boardService.scoreValue = 0;
  }
  focusDiv() {
    console.log('focused');
    document.getElementById('game-container').focus();
  }

  ngOnInit(): void {
    this.restartGame();
  }

}
