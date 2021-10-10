import { Component, OnInit } from '@angular/core';
import { BoardService } from '../shared/board.service';
import { Tile } from '../shared/tile.template';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  //  stores creates local instance of 2d tile array (board)
  tiles: Tile[][];
  inPlay: boolean = true;
  constructor(private boardService: BoardService) {
    this.restartGame();
  }

  addTile() {
    this.boardService.addTile();
  }

  test($event: KeyboardEvent) {
    this.boardService.moveTiles($event);
    this.inPlay = this.boardService.userHasMoves();
  }

  restartGame() {
    this.boardService.createBoard(Math.ceil(Math.random()*3));
    this.tiles = this.boardService.board;
    this.boardService.gameLost = false;
    this.inPlay = true;
    this.boardService.scoreValue = 0;
  }
  focusDiv() {
    document.getElementById('game-container').focus();
  }

  ngOnInit(): void {
  }

}
