import { Injectable } from "@angular/core";
import { Tile } from "./tile.template";

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // service copy of board of tiles
  tiles: Tile[][];
  // array of hex tile colours; can be gradients, images, whatever. doesn't matter.
  tileBackground: string[] = [
    '#dddddd',
    '#ffdc52',
    '#ff9a52',
    '#ff8052'
  ];

  // fills tiles 2d array with arrays, representing the game board
  constructor() {
    this.tiles = [new Array(4),new Array(4),new Array(4),new Array(4)]
  }

  createBoard(initialTiles: number) {
    // iterates through board, creates empty tile instances
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < this.tiles[i].length; j++) {
        this.tiles[i][j] = new Tile(true, -1);
      }
    }
    // establishes a list of banned coordinates in 2d space
    const bannedIndices: {x: number, y: number}[] = [];

    // generates a set number of initial tiles
    for (let i = 0; i < initialTiles; i++) {
      // generates 2 random values, within the width and height of gameboard; one x and one y
      const indices = {x: Math.floor(Math.random()*4), y: Math.floor(Math.random()*4)};
      // checks if any current object in the bannedIndices array matches the generated coordinates. if it does, decrement index and move to next iteration of loop (akin to restarting the current iteration)
      if (bannedIndices.some(banned => banned.x === indices.x && banned.y === indices.y)) {
        i--;
        continue;
      }
      // adds a new random tile that is not empty
      this.tiles[indices.y][indices.x] = new Tile(false, -1);
    }
  }

  addTile() {
    // defines an array representing all empty tiles in the board
    const emptyIndices: {x: number, y: number}[] = [];

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        // checks if a given tile is empty
        if (this.tiles[y][x].isEmpty) {
          // adds to the empty indices array
          emptyIndices.push({x: x, y: y});
        }
      }
    }

    // if there is at least one empty tile
    if (emptyIndices.length > 0) {
      // generates a random index from the emptyIndices array and stores it in rngCoords
      const rngCoords: {x: number, y: number} = emptyIndices[Math.floor(Math.random()*emptyIndices.length)];

      // creates a new random tile that is not empty at given coordinates
      this.tiles[rngCoords.y][rngCoords.x] = new Tile(false, -1);
    }

    else {
      // do more stuff here later for loss case, as this is the loss case
      alert('you lose!');
    }
  }

  moveTiles($event: KeyboardEvent) {
    // initial boolean to see if a tile should be added
    // this will all be refactored later, will not comment it out now.
    let modifiedBoard: boolean = false;

    switch ($event.key.toLocaleLowerCase()) {
      case 'w':
      case 'arrowup':
        modifiedBoard = this.moveUp();
      break;
      case 'd':
      case 'arrowright':
        this.moveRight();
      break;
      case 'a':
      case 'arrowleft':
        this.moveLeft();
      break;
      case 's':
      case 'arrowdown':
        this.moveDown();
      break;
    }
    if (modifiedBoard) {
      this.addTile();
    }

    // console.log($event.currentTarget);
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    if (pos.x > -1 && pos.x < 4 && pos.y < 4 && pos.y > -1) {
      if (this.board[pos.y][pos.x].isEmpty) {
        return true;
      }
      console.log(offset.x,offset.y);
      console.log(pos.x + offset.x, pos.y + offset.y);
      if (this.board[pos.y][pos.x].value === this.board[pos.y - offset.y][pos.x - offset.x].value) {
        console.log('should merge')
        return true;
      }
    }
    return false;
  }

  moveUp() {
    let modified: boolean = false;
    for (let y = 1; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!this.board[y][x].isEmpty) {
          const cPos = {y: y - 1, x: x};
          const pPos = {y: y, x: x};
          while (this.movable(cPos, {x: 0, y: -1})) {
            modified = true;
            if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
              this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
            }
            else {
              this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
            }
            this.board[pPos.y][pPos.x] = new Tile(true, -1);
            pPos.y = cPos.y;
            cPos.y -= 1;
          }
        }
      }
    }
    return modified;
  }

  moveDown() {
    for (let y = 2; y >= 0; y--) {
      for (let x = 0; x < 4; x++) {
        if (!this.board[y][x].isEmpty) {
          const cPos = {y: y + 1, x: x};
          const pPos = {y: y, x: x};
          while (this.movable(cPos, {x: 0, y: 1})) {
            if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
              this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
            }
            else {
              this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
            }
            this.board[pPos.y][pPos.x] = new Tile(true, -1);
            pPos.y = cPos.y;
            cPos.y += 1;
          }
        }
      }
    }
  }

  moveLeft() {
    for (let y = 0; y < 4; y++) {
      for (let x = 1; x < 4; x++) {
        if (!this.board[y][x].isEmpty) {
          const cPos = {y: y, x: x - 1};
          const pPos = {y: y, x: x};
          while (this.movable(cPos, {y: 0, x: -1})) {
          if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
            this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
          }
          else {
            this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
          }
            this.board[pPos.y][pPos.x] = new Tile(true, -1);
            pPos.x = cPos.x;
            cPos.x -= 1;
          }
          // const cPos = {y: y, x: x};
          // if (this.board[cPos.y][cPos.x - 1].isEmpty) {
          //   this.board[cPos.y][cPos.x - 1] = this.board[y][x];
          //   this.board[y][x] = new Tile(true);
          // }
        }
      }
    }
  }

  moveRight() {
    for (let y = 0; y < 4; y++) {
      for (let x = 2; x >= 0; x--) {
        if (!this.board[y][x].isEmpty) {
          const cPos = {y: y, x: x + 1};
          const pPos = {y: y, x: x};
          while (this.movable(cPos, {x: 1, y: 0})) {
            if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
              this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
            }
            else {
              this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
            }
            this.board[pPos.y][pPos.x] = new Tile(true, -1);
            pPos.x = cPos.x;
            cPos.x += 1;
          }
        }
      }
    }
  }

  get board() {
    return this.tiles.slice();
  }

  get colours() {
    return this.tileBackground.slice();
  }
}
