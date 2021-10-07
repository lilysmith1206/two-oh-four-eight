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
    '#ffffff' // 2^11, 2028
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

    for (let i = 0; i < initialTiles; i++) {
      this.addTile();
    }
    // // establishes a list of banned coordinates in 2d space
    // const bannedIndices: {x: number, y: number}[] = [];

    // // generates a set number of initial tiles
    // for (let i = 0; i < initialTiles; i++) {
    //   // generates 2 random values, within the width and height of gameboard; one x and one y
    //   const indices = {x: Math.floor(Math.random()*4), y: Math.floor(Math.random()*4)};
    //   // checks if any current object in the bannedIndices array matches the generated coordinates. if it does, decrement index and move to next iteration of loop (akin to restarting the current iteration)
    //   if (bannedIndices.some(banned => banned.x === indices.x && banned.y === indices.y)) {
    //     i--;
    //     continue;
    //   }
    //   // adds a new random tile that is not empty
    //   this.tiles[indices.y][indices.x] = new Tile(false, -1);
    // }
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
    // refactored!!! :>
    // two boolean variables to act as a switch; may not be necessary, but when i tested without didn't work
    let modifiedBoard: boolean = false;
    let modified: boolean = false;
    let offset: {y: number, x: number};


    switch ($event.key.toLocaleLowerCase()) {
      case 'w':
      case 'arrowup':
        // stores up offset in offset object
        offset = {y: -1, x: 0};
        // iterates through the tile array with predefined ranges
        for (let y = 1; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            // runs the moveDirection function with current indices and offset
            modified = this.moveDirection({y: y, x: x}, offset);
            // switch; if modified is ever true, modifiedBoard is true regardless of whether modified is false
            if (modified) {
              modifiedBoard = true;
            }
          }
        }

      break;
      case 'd':
      case 'arrowright':
        // see up comments for info on how this works
        offset = {x: 1, y: 0};
        for (let y = 0; y < 4; y++) {
          for (let x = 2; x >= 0; x--) {
            modified = this.moveDirection({x: x, y: y}, offset);
            if (modified) {
              modifiedBoard = true;
            }
          }
        }
      break;
      case 'a':
      case 'arrowleft':
        // see up comments for info on how this works
        offset = {x: -1, y: 0};
        for (let y = 0; y < 4; y++) {
          for (let x = 1; x < 4; x++) {
            modified = this.moveDirection({x: x, y: y}, offset);
            if (modified) {
              modifiedBoard = true;
            }
          }
        }
      break;
      case 's':
      case 'arrowdown':
        // see up comments for info on how this works
        offset = {y: 1, x: 0};
        for (let y = 2; y >= 0; y--) {
          for (let x = 0; x < 4; x++) {
            modified = this.moveDirection({y: y, x: x}, offset);
            if (modified) {
              modifiedBoard = true;
            }
          }
        }
      break;
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
    })


    // console.log($event.currentTarget);
  }

  movable(pos: {x: number, y: number}, offset: {x: number, y: number}) {
    // checks if the movement is in bounds
    if (pos.x > -1 && pos.x < 4 && pos.y < 4 && pos.y > -1) {
      // if the given position is empty, return that it's good to move there
      if (this.board[pos.y][pos.x].isEmpty) {
        return true;
      }
      // checks if the given tile's value and the tile previous in the movement are equal
      if (this.board[pos.y][pos.x].value === this.board[pos.y - offset.y][pos.x - offset.x].value) {
        // performs a NOR gate operation on the merged values on both tiles
        return !(this.board[pos.y][pos.x].hasMerged || this.board[pos.y - offset.y][pos.x - offset.x].hasMerged);
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

  get board() {
    return this.tiles.slice();
  }

  get colours() {
    return this.tileBackground.slice();
  }
}

// moveUp() {
//   let modified: boolean = false;
//   for (let y = 1; y < 4; y++) {
//     for (let x = 0; x < 4; x++) {
//       if (!this.board[y][x].isEmpty) {
//         const cPos = {y: y - 1, x: x};
//         const pPos = {y: y, x: x};
//         while (this.movable(cPos, {x: 0, y: -1})) {
//           modified = true;
//           if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
//             this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
//             this.board[cPos.y][cPos.x].hasMerged = true;
//           }
//           else {
//             this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
//           }
//           this.board[pPos.y][pPos.x] = new Tile(true, -1);
//           pPos.y = cPos.y;
//           cPos.y -= 1;
//         }
//       }
//     }
//   }
//   return modified;
// }

// moveDown() {
//   let modified: boolean = false;
//   for (let y = 2; y >= 0; y--) {
//     for (let x = 0; x < 4; x++) {
//       if (!this.board[y][x].isEmpty) {
//         const cPos = {y: y + 1, x: x};
//         const pPos = {y: y, x: x};
//         while (this.movable(cPos, {x: 0, y: 1})) {
//           modified = true;
//           if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
//             this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
//             this.board[cPos.y][cPos.x].hasMerged = true;
//           }
//           else {
//             this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
//           }
//           this.board[pPos.y][pPos.x] = new Tile(true, -1);
//           pPos.y = cPos.y;
//           cPos.y += 1;
//         }
//       }
//     }
//   }
//   return modified;
// }

// moveLeft() {
//   let modified: boolean = false;
//   for (let y = 0; y < 4; y++) {
//     for (let x = 1; x < 4; x++) {
//       if (!this.board[y][x].isEmpty) {
//         const cPos = {y: y, x: x - 1};
//         const pPos = {y: y, x: x};
//         while (this.movable(cPos, {y: 0, x: -1})) {
//           modified = true;
//           if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
//             this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
//             this.board[cPos.y][cPos.x].hasMerged = true;
//           }
//           else {
//             this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
//           }
//             this.board[pPos.y][pPos.x] = new Tile(true, -1);
//             pPos.x = cPos.x;
//             cPos.x -= 1;
//         }
//       }
//     }
//   }
//   return modified;
// }

// moveRight() {
//   let modified: boolean = false;
//   for (let y = 0; y < 4; y++) {
//     for (let x = 2; x >= 0; x--) {
//       if (!this.board[y][x].isEmpty) {
//         const cPos = {y: y, x: x + 1};
//         const pPos = {y: y, x: x};
//         while (this.movable(cPos, {x: 1, y: 0})) {
//           modified = true;
//           if (this.board[cPos.y][cPos.x].value === this.board[pPos.y][pPos.x].value) {
//             this.board[cPos.y][cPos.x] = new Tile(false, this.board[cPos.y][cPos.x].value*2);
//             this.board[cPos.y][cPos.x].hasMerged = true;
//           }
//           else {
//             this.board[cPos.y][cPos.x] = this.board[pPos.y][pPos.x];
//           }
//           this.board[pPos.y][pPos.x] = new Tile(true, -1);
//           pPos.x = cPos.x;
//           cPos.x += 1;
//         }
//       }
//     }
//   }
//   return modified;
// }
