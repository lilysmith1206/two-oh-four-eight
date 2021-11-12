import { EventEmitter, Injectable, KeyValueDiffers } from "@angular/core";
import { MovementService } from "./movement.service";
import { Tile } from "./tile.template";

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // service copy of board of tiles
  tiles: Tile[][];

  score: number = 0;
  // global direction variable for movement, gets reset after each movement but not before
  private dir: string;

  // global consts meant to be available to any component that needs it
  public GLOBAL_CONSTANTS = {
    animationDelay: 100
  }

  // used to prevent input before animations are completed, it looks weird without this
  public inputAllowed: boolean = true;

  // emitter, to control when the board is updated
  tileUpdateEmitter: EventEmitter<Tile[][]> = new EventEmitter();

  // array of hex tile colours; can be gradients, images, whatever.
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
  gameHasMoves = new EventEmitter<boolean>();

  constructor(private movementService: MovementService) {
    // fills tiles 2d array with arrays, representing the game board
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

    this.tileUpdateEmitter.emit(this.board);
  }

  setBoard(tiles: Tile[][]) {
    this.tiles = tiles;

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
      this.tiles[rngCoords.y][rngCoords.x] = new Tile(false);
      this.tiles[rngCoords.y][rngCoords.x].isNew = true;
    }
  }

  moveTiles(key: string) {

    if (!this.gameLost && this.inputAllowed) {

      // two boolean variables to act as a switch; may not be necessary, but when i tested without didn't work
      let modifiedBoard: boolean = false;
      let modified: boolean = false;
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

      switch (key.toLocaleLowerCase()) {
        case 'w':
        case 'arrowup':
        case 'up':
          this.dir = 'up';
        break;
        case 'd':
        case 'arrowright':
        case 'right':
          this.dir = 'right';
        break;
        case 'a':
        case 'arrowleft':
        case 'left':
          this.dir = 'left';
        break;
        case 's':
        case 'arrowdown':
        case 'down':
          this.dir = 'down';
        break;
      }
      // just for readability, as movementConfiguration[dir].loop.y.start was hell
      const loopConfig = movementConfiguration[this.dir].loop;
      const offset = movementConfiguration[this.dir].offset;

      // sets all tile states to not be new, so the new tile animation ceases
      this.tiles.forEach( (row) => row.forEach( (tile) => tile.isNew = false));

      // god okay this is just.. i don't even know if this is even necessary anymore? whatever i'll refactor it later
      for (let y = loopConfig.y.start; loopConfig.y.loopTest(y); y += loopConfig.y.modifier) {
        for (let x = loopConfig.x.start; loopConfig.x.loopTest(x); x += loopConfig.x.modifier) {

          // skips tile movement if the board is empty, used to be in the movement function but like why
          if (!this.board[y][x].isEmpty) {
            // runs the moveDirection function with current indices and offset
            modified = this.moveDirection({y: y, x: x}, offset);
          }
          // switch; if modified is ever true, modifiedBoard is true regardless of whether modified is false after
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
            // this destroys the old tiles and adds new ones. i'm gonna be real with future me, i got no idea
            // why this is necessary, so just leave it.
            const tile = this.board[y][x]
            const details = {
              value: tile.value,
              isEmpty: tile.isEmpty,
              isNew: tile.isNew
            };

            this.board[y][x] = new Tile(details.isEmpty, details.value);
            this.board[y][x].isNew = details.isNew;

            // this is uh. sure some math. check the end of the file for details on this.
            const z = ((-movementConfiguration[this.dir].offset.y * y) + 6) + ((-movementConfiguration[this.dir].offset.x * x) + 6);

            this.movementService.sendZIndexToDirective(z, {y: y, x: x});
          }
        }

        // does this need explanation
        if (!this.userHasMoves()) {
          console.log('game lost')
          this.gameLost = true;
          this.gameHasMoves.emit(false);
        }
      });

      // stops allowing input until all animations have ceased happening. prevents weird stuff.
      this.inputAllowed = false;
      setTimeout( () => {
        this.inputAllowed = true;
        this.tileUpdateEmitter.emit(this.board);
      }, this.GLOBAL_CONSTANTS.animationDelay);
    }
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
          // this is the equivalent of the earlier modifiedBoard and modified variables.
          tileOptions = tileOptions ? true : this.movable({y: y, x: x}, offsets[i]);

          if (tileOptions) {
            // since movable returns either a string or a boolean, and movable expects a boolean, tileOptions gets the
            // ol truthy/falsey treatment
            movable = !!tileOptions;
            break;
          }
        }

      }
      // just exits early if it's true, so we don't waste time.
      if (movable) {
        break;
      }
    }

    return movable;
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    // checks if the movement is in bounds
    if (pos.x + offset.x > -1 && pos.x + offset.x < 4 && pos.y + offset.y < 4 && pos.y + offset.y > -1) {
      // gets the tiles from the board positions, to do comparisons on.
      const nextTile: Tile = this.board[pos.y + offset.y][pos.x + offset.x];
      const curTile: Tile = this.board[pos.y][pos.x];
      // if the next tile is empty, it's good to move there.
      if (nextTile.isEmpty) {
        return "empty";
      }
      // checks if the both tiles have the same value
      if (!(curTile.value - nextTile.value)) {
        // uses NOR logic to check if neither tile has already merged
        return !(nextTile.hasMerged || curTile.hasMerged) ? 'merger' : false;
      }

      return false;
    }
  }

  moveDirection(pos: {y: number, x: number}, offset: {y: number, x: number}) {
    // general movement function, replacing the specific moveUp, moveDown etc functions
    // modifiedBoard boolean for adding a tile
    let hasModifiedBoard: boolean = false;

    // records movement for movement animations
    let movementRecord = [];

    // sets current and future position
    const cPos = {y: pos.y, x: pos.x};

    const fPos = {y: cPos.y + offset.y, x: cPos.x + offset.x};

    // stores whether the next tile is movable to
    let canMove = this.movable(cPos, offset);

    while (canMove) {

      hasModifiedBoard = true;
      movementRecord.push(canMove);

      switch (canMove) {
        case 'merger':
          // sets the next tile to have twice the value as the current one
          this.board[fPos.y][fPos.x] = new Tile(false, this.board[fPos.y][fPos.x].value*2);

          // adds value to scoreboard
          this.addValueScoreboard(this.board[fPos.y][fPos.x].value);

          // sets the new tile to have merged, so it can't continue merging
          this.board[fPos.y][fPos.x].hasMerged = true;
        break;
        case 'empty':
          // just moves the tile
          this.board[fPos.y][fPos.x] = this.board[cPos.y][cPos.x];
        break;
      }
      // sets past tile to empty tile
      this.board[cPos.y][cPos.x] = new Tile(true);
      // swaps around coordinates
      cPos.y = fPos.y;
      cPos.x = fPos.x;
      // adds the movement offsets
      fPos.y += offset.y;
      fPos.x += offset.x;
      // resets the variable so no infinite loop
      canMove = this.movable(cPos, offset);
    }

    if (movementRecord.length > 0) {
      // only if the movement succeeded, emit the movement info
      this.movementService.sendAnimationToDirective(this.dir, movementRecord.length, pos);
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
