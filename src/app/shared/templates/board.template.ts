import { NULL_EXPR } from "@angular/compiler/src/output/output_ast";
import { CONSTANTS } from "../libraries/constants";
import { Tile } from "./tile.template";

export enum Dir {
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down',
  RIGHT = 'right'
}

abstract class BoardMovementHandler extends CONSTANTS {
  constructor() {
    super();
  }

  protected _board: Tile[][];
  protected readonly movementConfiguration = {
    'up': {
      loop: {
        x: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < this.CONSTS.board.width)
        },
        y: {
          modifier: 1,
          start: 1,
          loopTest: ((val: number) => val < this.CONSTS.board.height)
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
          loopTest: ((val: number) => val < this.CONSTS.board.width)
        },
        y: {
          modifier: -1,
          start: this.CONSTS.board.height - 1,
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
          loopTest: ((val: number) => val < this.CONSTS.board.width)
        },
        y: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < this.CONSTS.board.height)
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
          start: this.CONSTS.board.width - 1,
          loopTest: ((val: number) => val >= 0)
        },
        y: {
          modifier: 1,
          start: 0,
          loopTest: ((val: number) => val < this.CONSTS.board.height)
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
            movementRecord[y * this.CONSTS.board.height + x] = tileMoves;
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
      for (let y = 0; y < this.CONSTS.board.height; y++) {
        for (let x = 0; x < this.CONSTS.board.width; x++) {
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
    const cPos = {y: y, x: x};

    const fPos = {y: y + offset.y, x: x + offset.x};

    // stores whether the next tile is movable to
    let canMove = this.movable(cPos, offset);

    while (canMove) {

      hasModifiedBoard = true;
      tileMoves.push(canMove);

      switch (canMove) {
        case 'merger':
          // sets the next tile to have twice the value as the current one
          this._board[fPos.y][fPos.x] = new Tile(false, this._board[fPos.y][fPos.x].value*2);

          score = this._board[fPos.y][fPos.x].value * 2;

          // sets the new tile to have merged, so it can't continue merging
          this._board[fPos.y][fPos.x].hasMerged = true;
        break;
        case 'empty':
          // just moves the tile
          this._board[fPos.y][fPos.x] = this._board[cPos.y][cPos.x];
        break;
      }
      // sets past tile to empty tile
      this._board[cPos.y][cPos.x] = new Tile(true);
      // swaps around coordinates
      cPos.y = fPos.y;
      cPos.x = fPos.x;
      // adds the movement offsets
      fPos.y += offset.y;
      fPos.x += offset.x;
      // resets the variable so no infinite loop
      canMove = this.movable(cPos, offset);
    }

    return {hasModifiedBoard, tileMoves, score}
  }

  protected getDirectionFromPressedKey(key: string): Dir | undefined {
    switch (key.toLocaleLowerCase()) {
      case 'w':
      case 'arrowup':
      case 'up':
        return Dir.UP
      break;
      case 'd':
      case 'arrowright':
      case 'right':
        return Dir.RIGHT
      break;
      case 'a':
      case 'arrowleft':
      case 'left':
        return Dir.LEFT;
      break;
      case 's':
      case 'arrowdown':
      case 'down':
        return Dir.DOWN;
      break;
      default: return null;
    }
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    // checks if the movement is in bounds
    if (pos.x + offset.x > -1 && pos.x + offset.x < this.CONSTS.board.width && pos.y + offset.y < this.CONSTS.board.height && pos.y + offset.y > -1) {
      // gets the tiles from the board positions, to do comparisons on.
      const nextTile: Tile = this._board[pos.y + offset.y][pos.x + offset.x];
      const curTile: Tile = this._board[pos.y][pos.x];
      // if the next tile is empty, it's good to move there.
      if (nextTile.isEmpty) {
        return "empty";
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
  protected tileStyles = {
    light: [
      {backgroundColor: '#DDDDDD', color: 'black'}, // 2^0, or blank cell
      {backgroundColor: '#FFF7DC', color: 'black'}, // 2^1, 2
      {backgroundColor: '#FFEBB5', color: 'black'}, // 2^2, 4
      {backgroundColor: '#FFCE52', color: 'black'}, // 2^3, 8
      {backgroundColor: '#FFA625', color: 'black'}, // 2^4, 16
      {backgroundColor: '#DD8117', color: 'white'}, // 2^5, 32
      {backgroundColor: '#E07020', color: 'white'}, // 2^6, 64
      {backgroundColor: '#EE7D0F', color: 'white'}, // 2^7, 128
      {backgroundColor: '#FFB216', color: 'black'}, // 2^8, 256
      {backgroundColor: '#FED613', color: 'black'}, // 2^9, 512
      {backgroundColor: '#FCEB09', color: 'black'}, // 2^10 1024
      {backgroundColor: '#F1F50A', color: 'black'} // 2^11, 2048
    ],
    dark: [
        {backgroundColor: 'hsl(0, 0%, 17%)', color: 'black'}, // 2^0, or blank cell
        {backgroundColor: 'hsl(46, 100%, 73%)', color: 'black'}, // 2^1, 2
        {backgroundColor: 'hsl(44, 100%, 65%)', color: 'black'}, // 2^2, 4
        {backgroundColor: 'hsl(43, 100%, 46%)', color: 'white'}, // 2^3, 8
        {backgroundColor: 'hsl(36, 100%, 37%)', color: 'white'}, // 2^4, 16
        {backgroundColor: 'hsl(32, 81%, 28%)', color: 'white'}, // 2^5, 32
        {backgroundColor: 'hsl(25, 76%, 30%)', color: 'white'}, // 2^6, 64
        {backgroundColor: 'hsl(30, 88%, 30%)', color: 'white'}, // 2^7, 128
        {backgroundColor: 'hsl(40, 100%, 34%)', color: 'white'}, // 2^8, 256
        {backgroundColor: 'hsl(50, 99%, 34%)', color: 'white'}, // 2^9, 512
        {backgroundColor: 'hsl(56, 98%, 31%)', color: 'white'}, // 2^10 1024
        {backgroundColor: 'hsl(61, 92%, 30%)', color: 'white'} // 2^11, 2048
    ]
  };

  constructor(public w?: number, public h?: number) {
    super();

    this.width = w  ?? this.CONSTS.board.width;
    this.height = h ?? this.CONSTS.board.height;
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
      const randomEmptyPosition: {x: number, y: number} = emptyIndices[Math.floor(Math.random()*emptyIndices.length)];
      // creates a new random tile that is not empty at given coordinates
      this._board[randomEmptyPosition.y][randomEmptyPosition.x] = new Tile(false);
      this._board[randomEmptyPosition.y][randomEmptyPosition.x].isNew = true;
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

    for (let y = 0; y < this.CONSTS.board.height; y++) {
      for (let x = 0; x < this.CONSTS.board.width; x++) {
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
