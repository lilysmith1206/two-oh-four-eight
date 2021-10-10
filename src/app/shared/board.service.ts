import { EventEmitter, Injectable, KeyValueDiffers } from "@angular/core";
import { Tile } from "./tile.template";

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // service copy of board of tiles
  tiles: Tile[][];
  score: number = 0;
  // array of hex tile colours; can be gradients, images, whatever. doesn't matter.
  tileBackground: string[] = [
    '#dddddd', // 2^0, or blank cell
    '#eeeeee', // 2^1, 2
    '#ffefc2', // 2^2, 4
    '#ffce80', // 2^3, 8
    '#fab548', // 2^4, 16
    '#ffd103', // 2^5, 32
    '#ffd900', // 2^6, 64
    '#ffe138', // 2^7, 128
    '#ffe866', // 2^8, 256
    '#fff2a6', // 2^9, 512
    '#fff8cf', // 2^10 1024
    '#ffffff' // 2^11, 2048
  ];

  gameLost: boolean = false;

  scoreUpdated = new EventEmitter<number>();
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

    for (let i = 0; i < initialTiles; i++) {
      this.addTile();
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
      this.tiles[rngCoords.y][rngCoords.x].isNew = true;
    }
  }

  moveTiles($event: KeyboardEvent) {

    if (!this.gameLost) {
      // refactored!!! :>
      // two boolean variables to act as a switch; may not be necessary, but when i tested without didn't work
      let modifiedBoard: boolean = false;
      let modified: boolean = false;
      let dir: string;
      const movementConfiguration = {
        'up': {
          loop: {
            x: {
              modifier: 1,
              start: 0,
              loopTest: ((val: number) => val < 4)
            },
            y: {
              modifier: 1,
              start: 1,
              loopTest: ((val: number) => val < 4)
            },
          },
          offset: {
            x: 0,
            y: -1
          }
        },
        'down': {
          loop: {
            x: {
              modifier: 1,
              start: 0,
              loopTest: ((val: number) => val < 4)
            },
            y: {
              modifier: -1,
              start: 3,
              loopTest: ((val: number) => val >= 0)
            }
          },
          offset: {
            x: 0,
            y: 1
          }
        },
        'left': {
          loop: {
            x: {
              modifier: 1,
              start: 1,
              loopTest: ((val: number) => val < 4)
            },
            y: {
              modifier: 1,
              start: 0,
              loopTest: ((val: number) => val < 4)
            }
          },
          offset: {
            x: -1,
            y: 0
          }
        },
        'right': {
          loop: {
            x: {
              modifier: -1,
              start: 3,
              loopTest: ((val: number) => val >= 0)
            },
            y: {
              modifier: 1,
              start: 0,
              loopTest: ((val: number) => val < 4)
            }
          },
          offset: {
            x: 1,
            y: 0
          }
        }
      }

      switch ($event.key.toLocaleLowerCase()) {
        case 'w':
        case 'arrowup':
          dir = 'up';
        break;
        case 'd':
        case 'arrowright':
          dir = 'right';
        break;
        case 'a':
        case 'arrowleft':
          dir = 'left';
        break;
        case 's':
        case 'arrowdown':
          dir = 'down';
        break;
      }
      // just for readability, as movementConfiguration[dir].loop.y.start was hell
      const loopConfig = movementConfiguration[dir].loop;
      const offset = movementConfiguration[dir].offset;

      for (let y = loopConfig.y.start; loopConfig.y.loopTest(y); y += loopConfig.y.modifier) {
        for (let x = loopConfig.x.start; loopConfig.x.loopTest(x); x += loopConfig.x.modifier) {
          // runs the moveDirection function with current indices and offset
          modified = this.moveDirection({y: y, x: x}, offset);
          // switch; if modified is ever true, modifiedBoard is true regardless of whether modified is false
          if (modified) {
            modifiedBoard = true;
          }
        }
      }
      // makes it so this operation is synchronous; i had issues here
      setTimeout(() => {
        // iterates through tiles
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            // sets each tile to merged as false, so they can merge in future movements
            this.tiles[y][x].hasMerged = false;
          }
        }
        // if the movement succeeded, add a tile to the board
        if (modifiedBoard) {
          this.addTile();
        }

        for (let y = 0; y < 4; y++) {
          for(let x = 0; x < 4; x++) {
            const details: {value: number, isEmpty: boolean} = {value: this.board[y][x].value, isEmpty: this.board[y][x].isEmpty};
            this.board[y][x] = new Tile(details.isEmpty, details.value);
          }
        }

        if (!this.userHasMoves) {
          this.gameLost = true;
        }
      });

    }
    // console.log($event.currentTarget);
  }

  userHasMoves() {
    let movable: boolean = false;

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let tileOptions: boolean = false;
        let possTile: Tile;
        let curTile: Tile = this.board[y][x];
        if (y > 0) {
          possTile = this.board[y - 1][x];
          if (possTile.isEmpty || (possTile.value === curTile.value) && !(curTile.hasMerged || possTile.hasMerged)) {
            tileOptions = true;
          }
        }
        if (y < 3) {
            possTile = this.board[y + 1][x];
            if (possTile.isEmpty || (possTile.value === curTile.value) && !(curTile.hasMerged || possTile.hasMerged)) {
              tileOptions = true;
            }
        }
        if (x > 0) {
          possTile = this.board[y][x - 1];
          if (possTile.isEmpty || (possTile.value === curTile.value) && !(curTile.hasMerged || possTile.hasMerged)) {
            tileOptions = true;
          }
        }
        if (x < 3) {
          possTile = this.board[y][x + 1];
          if (possTile.isEmpty || (possTile.value === curTile.value) && !(curTile.hasMerged || possTile.hasMerged)) {
            tileOptions = true;
          }
        }

        if (tileOptions) {
          movable = true;
        }

      }
      if (movable) {
        break;
      }
    }

    return movable;
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    // checks if the movement is in bounds
    if (pos.x > -1 && pos.x < 4 && pos.y < 4 && pos.y > -1) {
      const curTile: Tile = this.board[pos.y - offset.y][pos.x - offset.x];
      const nextTile: Tile = this.board[pos.y][pos.x];
      // if the given position is empty, return that it's good to move there
      if (nextTile.isEmpty) {
        return true;
      }
      // checks if the given tile's value and the tile previous in the movement are equal
      if (curTile.value === nextTile.value) {
        // performs a NOR gate operation on the merged values on both tiles
        return !(nextTile.hasMerged || curTile.hasMerged);
      }
      return false;
    }
  }

  moveDirection(pos: {y: number, x: number}, offset: {y: number, x: number}) {
    // general movement function, replacing the specific moveUp, moveDown etc functions
    // modifiedBoard boolean for adding a tile
    let modifiedBoard: boolean = false;

    // checks if the given position is an empty tile; if it is, don't run this code
    if (!this.board[pos.y][pos.x].isEmpty) {
      // sets past position
      const pPos = {y: pos.y, x: pos.x};
      // sets future position
      const cPos = {y: pPos.y + offset.y, x: pPos.x + offset.x};
      // while the future tile is movable to
      while (this.movable(cPos, offset)) {
        // sets that board was modified to true
        modifiedBoard = true;
        // checks if the two values of tiles are equal
        if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {

          // creates a new non-empty that has 2x the value of the current tile
          this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);

          this.addValueScoreboard(this.board[cPos.y][cPos.x].value);
          // sets the new tile to have merged, so it can't continue merging
          this.board[cPos.y][cPos.x].hasMerged = true;
        }
        else {
          // sets future tile to past tile
          this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
        }
        // sets past tile to a new empty tile
        this.board[pPos.y][pPos.x] = new Tile(true, -1);
        // swaps around coordinates
        pPos.y = cPos.y;
        pPos.x = cPos.x;
        // adds the movement offsets
        cPos.y += offset.y;
        cPos.x += offset.x;
      }
    }
    return modifiedBoard;
  }

  addValueScoreboard(value: number) {
    this.score += value;
    this.scoreUpdated.emit(this.score);
  }

  get board() {
    return this.tiles.slice();
  }

  get colours() {
    return this.tileBackground.slice();
  }

  get scoreValue() {
    return this.score;
  }

  set scoreValue(scoreVal: number) {
    this.score = scoreVal;
    this.scoreUpdated.emit(this.score);
  }
}
