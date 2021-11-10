import { EventEmitter, Injectable, KeyValueDiffers } from "@angular/core";
import { Tile } from "./tile.template";

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // service copy of board of tiles
  tiles: Tile[][];
  score: number = 0;

  tileUpdateEmitter: EventEmitter<Tile[][]> = new EventEmitter();
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
    '#fffbe6' // 2^11, 2048
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
        this.tiles[i][j] = new Tile(true);
      }
    }

    for (let i = 0; i < initialTiles; i++) {
      this.addTile();
    }

    this.tiles[2][3] = new Tile(false, 2048);

    this.tileUpdateEmitter.emit(this.board);
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

      this.tiles.forEach( (row) => row.forEach( (tile) => tile.isNew = false));

      for (let y = loopConfig.y.start; loopConfig.y.loopTest(y); y += loopConfig.y.modifier) {
        for (let x = loopConfig.x.start; loopConfig.x.loopTest(x); x += loopConfig.x.modifier) {

          if (!this.board[y][x].isEmpty) {
          // runs the moveDirection function with current indices and offset
            modified = this.moveDirection({y: y, x: x}, offset);
          }
          // switch; if modified is ever true, modifiedBoard is true regardless of whether modified is false
          if (modified) {
            modifiedBoard = true;
          }
        }
      }
      // makes it so this operation is synchronous; i had issues here
      setTimeout(() => {

        // if the movement succeeded, add a tile to the board
        if (modifiedBoard) {
          this.addTile();
        }

        for (let y = 0; y < 4; y++) {
          for(let x = 0; x < 4; x++) {
            const tile = this.board[y][x]
            const details = {
              value: tile.value,
              isEmpty: tile.isEmpty,
              isNew: tile.isNew
            };
            this.board[y][x] = new Tile(details.isEmpty, details.value);
            this.board[y][x].isNew = details.isNew;
          }
        }

        if (!this.userHasMoves) {
          this.gameLost = true;
        }
      });

      setTimeout( () => {
      this.tileUpdateEmitter.emit(this.board);
      });
    }
    // console.log($event.currentTarget);
  }

  userHasMoves() {
    let movable: boolean = false;

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let tileOptions: (boolean | string) = false;

        const offsets = [
          {x: 0, y: -1},
          {x: 0, y: 1},
          {x: 1, y: 0},
          {x: -1, y: 0}
        ]

        for (let i = 0; i < offsets.length; i++) {
          tileOptions = tileOptions ? true : this.movable({y: y, x: x}, offsets[i]);
          if (tileOptions) { movable = !!tileOptions; break; }
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
    if (pos.x + offset.x > -1 && pos.x + offset.x < 4 && pos.y + offset.y < 4 && pos.y + offset.y > -1) {
      const nextTile: Tile = this.board[pos.y + offset.y][pos.x + offset.x];
      const curTile: Tile = this.board[pos.y][pos.x];
      // if the given position is empty, return that it's good to move there
      if (nextTile.isEmpty) {
        return "empty";
      }
      // checks if the given tile's value and the tile previous in the movement are equal
      if (curTile.value === nextTile.value) {
        // performs a NOR gate operation on the merged values on both tiles
        return !(nextTile.hasMerged || curTile.hasMerged) ? 'merger' : false;
      }
      return false;
    }
  }

  moveDirection(pos: {y: number, x: number}, offset: {y: number, x: number}) {
    // general movement function, replacing the specific moveUp, moveDown etc functions
    // modifiedBoard boolean for adding a tile
    let hasModifiedBoard: boolean = false;

    // checks if the given position is an empty tile; if it is, don't run this code
    // sets current and future position
    const cPos = {y: pos.y, x: pos.x};

    const fPos = {y: cPos.y + offset.y, x: cPos.x + offset.x};

    let canMove = this.movable(cPos, offset);
    // while the future tile is movable to

    while (canMove) {

      // sets that board was modified to true
      hasModifiedBoard = true;

      console.log(canMove);
      // checks if the two values of tiles are equal
      if (this.board[cPos.y][cPos.x].value === this.board[fPos.y][fPos.x].value) {

        // creates a new non-empty that has 2x the value of the current tile
        this.board[fPos.y][fPos.x] = new Tile(false, this.board[fPos.y][fPos.x].value*2);

        this.addValueScoreboard(this.board[fPos.y][fPos.x].value);
        // sets the new tile to have merged, so it can't continue merging
        this.board[fPos.y][fPos.x].hasMerged = true;
      }
      else {
        // sets future tile to past tile
        this.board[fPos.y][fPos.x] = this.board[cPos.y][cPos.x];
      }
      // sets past tile to a new empty tile
      this.board[cPos.y][cPos.x] = new Tile(true, -1);
      // swaps around coordinates
      cPos.y = fPos.y;
      cPos.x = fPos.x;
      // adds the movement offsets
      fPos.y += offset.y;
      fPos.x += offset.x;

      canMove = this.movable(cPos, offset);
    }
    return hasModifiedBoard;
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
