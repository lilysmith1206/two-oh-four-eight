import { constants } from '../libraries/constants';
import { Tile } from './tile.template';

export enum Dir {
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down',
  RIGHT = 'right'
}

abstract class BoardMovementHandler {
  constructor() {}

  protected _board: Tile[][];

  protected readonly movementConfiguration = {
    'up': {
      loop: {
        x: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < constants.board.width)
        },
        y: {
          modifier: 1,
          start: 1,
          loopTest: ((val: number) => val < constants.board.height)
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
          loopTest: ((val: number) => val < constants.board.width)
        },
        y: {
          modifier: -1,
          start: constants.board.height - 1,
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
          loopTest: ((val: number) => val < constants.board.width)
        },
        y: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < constants.board.height)
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
          start: constants.board.width - 1,
          loopTest: ((val: number) => val >= 0)
        },
        y: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < constants.board.height)
        }
      },
      offset: {
        x: 1,
        y: 0
      }
    }
  };

  protected inputAllowed: boolean = true;


  moveTiles(input: string) {
    if (this.inputAllowed) {
    const direction = this.getDirectionFromPressedKey(input);
    const movementLoopControlValues = this.movementConfiguration[direction];

    let scoreToBeAdded = 0;
    let movementRecord = {};

    let modifiedBoard = false;

    this._board.forEach(r => r.forEach(t => t.isNew = false));
    //  this._board.forEach( (row) => row.forEach( (tile) => tile.isNew = false));
    // if animations break come back here

    for (let y = movementLoopControlValues.loop.y.start; movementLoopControlValues.loop.y.loopTest(y); y += movementLoopControlValues.loop.y.modifier) {
      for (let x = movementLoopControlValues.loop.x.start; movementLoopControlValues.loop.x.loopTest(x); x += movementLoopControlValues.loop.x.modifier) {

        if (!this._board[y][x].isEmpty) {
          // runs the moveDirection function with current indices and offset
          const {hasModifiedBoard, tileMoves, score } = this.moveDirection(y, x, movementLoopControlValues.offset);

          scoreToBeAdded += score;

          if (hasModifiedBoard) {
            movementRecord[y * constants.board.height + x] = tileMoves;
          }
          modifiedBoard = hasModifiedBoard || modifiedBoard;
        }
        // switch; if modified is ever true, modifiedBoard is true regardless of whether modified is false after
      }
    }

    if (modifiedBoard) {
      this.addTile();
    }

    this.recreateBoard();


      return {scoreToBeAdded, modifiedBoard, movementRecord, direction}
    }
  }

    recreateBoard() {
      for (let y = 0; y < constants.board.height; y++) {
        for (let x = 0; x < constants.board.width; x++) {
          const tileDetails = {
            new: this._board[y][x].isNew,
            empty: this._board[y][x].isEmpty,
            value: this._board[y][x].value
          };

          this._board[y][x] = new Tile(tileDetails.empty, tileDetails.value);
          this._board[y][x].isNew = tileDetails.new;
        }
      }
    }

    abstract addTile(): void;

  private moveDirection(y: number, x: number, offset: {y: number, x: number}) {
    // general movement function, replacing the specific moveUp, moveDown etc functions
    // modifiedBoard boolean for adding a tile
    let hasModifiedBoard: boolean = false;

    // records movement for movement animations
    let tileMoves: string[] = [];
    let score = 0;

    // sets current and future position
    const currentPosition = {y: y, x: x};

    const futurePosition = {y: y + offset.y, x: x + offset.x};

    // stores whether the next tile is movable to
    let canMove = this.movable(currentPosition, offset);

    while (canMove) {

      hasModifiedBoard = true;
      tileMoves.push(canMove);

      switch (canMove) {
        case 'merger':
          // sets the next tile to have twice the value as the current one
          this._board[futurePosition.y][futurePosition.x] = new Tile(false, this._board[futurePosition.y][futurePosition.x].value*2);

          score = this._board[futurePosition.y][futurePosition.x].value;

          // sets the new tile to have merged, so it can't continue merging
          this._board[futurePosition.y][futurePosition.x].hasMerged = true;
        break;
        case 'empty':
          // just moves the tile
          this._board[futurePosition.y][futurePosition.x] = this._board[currentPosition.y][currentPosition.x];
        break;
      }
      // sets past tile to empty tile
      this._board[currentPosition.y][currentPosition.x] = new Tile(true);
      // swaps around coordinates
      currentPosition.y = futurePosition.y;
      currentPosition.x = futurePosition.x;
      // adds the movement offsets
      futurePosition.y += offset.y;
      futurePosition.x += offset.x;
      // resets the variable so no infinite loop
      canMove = this.movable(currentPosition, offset);
    }

    return {hasModifiedBoard, tileMoves, score}
  }

  protected getDirectionFromPressedKey(key: string): Dir | undefined {
    switch (key.toLocaleLowerCase()) {
      case 'w':
      case 'arrowup':
      case 'up':
        return Dir.UP
      case 'd':
      case 'arrowright':
      case 'right':
        return Dir.RIGHT
      case 'a':
      case 'arrowleft':
      case 'left':
        return Dir.LEFT;
      case 's':
      case 'arrowdown':
      case 'down':
        return Dir.DOWN;
      default: return null;
    }
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    // checks if the movement is in bounds
    if (pos.x + offset.x > -1 && pos.x + offset.x < constants.board.width && pos.y + offset.y < constants.board.height && pos.y + offset.y > -1) {
      // gets the tiles from the board positions, to do comparisons on.
      const nextTile: Tile = this._board[pos.y + offset.y][pos.x + offset.x];
      const curTile: Tile = this._board[pos.y][pos.x];
      // if the next tile is empty, it's good to move there.
      if (nextTile.isEmpty) {
        return 'empty';
      }
      // checks if the both tiles have the same value
      if (curTile.value === nextTile.value) {
        // uses NOR logic to check if neither tile has already merged
        return !(nextTile.hasMerged || curTile.hasMerged) ? 'merger' : false;
      }

      return false;
    }
  }

}

export class Board extends BoardMovementHandler {

  protected width: number;
  protected height: number;

  constructor(width?: number, height?: number) {
    super();

    this.width = width ?? constants.board.width;
    this.height = height ?? constants.board.height;
  }

  createStarterBoard(beginningTileAmount: number) {

    this.initialiseEmptyBoard();

    for (let i = 0; i < beginningTileAmount; i++) {
      this.addTile();
    }

    return this.board;
  }

    private initialiseEmptyBoard(): void {
      this._board = [];

      for (let y = 0; y < this.height; y++) {
        this._board[y] = [];

        for (let x = 0; x < this.width; x++) {
          this._board[y][x] = new Tile(true);
        }
      }
    }

  override addTile(): void {
    // defines an array representing all empty tiles in the board
    const emptyIndices: {x: number, y: number}[] = this.getEmptyTileIndices();

    if (emptyIndices.length > 0) {
      // generates a random index from the emptyIndices array and stores it in rngCoords
      const randomEmptyPositionition: {x: number, y: number} = emptyIndices[Math.floor(Math.random()*emptyIndices.length)];
      // creates a new random tile that is not empty at given coordinates
      this._board[randomEmptyPositionition.y][randomEmptyPositionition.x] = new Tile(false);
      this._board[randomEmptyPositionition.y][randomEmptyPositionition.x].isNew = true;
    }
  }

    private getEmptyTileIndices() {
      const emptyTiles = [];

      for (let y = 0; y < this._board.length; y++) {
        for (let x = 0; x < this._board[y].length; x++) {
          // checks if a given tile is empty
          if (this._board[y][x].isEmpty) {
            // adds to the empty indices array
            emptyTiles.push({x: x, y: y});
          }
        }
      }

      return emptyTiles;
    }

  isBoardMovable() {
    let movable: boolean = false;

    for (let y = 0; y < constants.board.height; y++) {
      for (let x = 0; x < constants.board.width; x++) {
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

  get board() {
    return this._board.slice();
  }

  set board(gameBoard: Tile[][]) {
    this._board = gameBoard.slice();
  }
}
