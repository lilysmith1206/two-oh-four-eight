import { Component, OnInit } from '@angular/core';
import { BoardService } from './shared/board.service';
import { Tile } from './shared/tile.template';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  //  stores creates local instance of 2d tile array (board)
  tiles: Tile[][];
  constructor(private boardService: BoardService) {
    boardService.createBoard(Math.ceil(Math.random()*3));
    this.tiles = boardService.board;
  }

  addTile() {
    this.boardService.addTile();
  }

  test($event: KeyboardEvent) {
    this.boardService.moveTiles($event);
  }

  ngOnInit(): void {
  }

}
