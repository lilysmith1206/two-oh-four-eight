import { Directive, Input, Renderer2, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Subscriber } from 'rxjs';
import { BoardService } from './board.service';
import { MovementService } from './movement.service';
import { Tile } from './tile.template';``
import * as transition from './transition.min.js'

@Directive({
  selector: '[TileDirective]'
})

export class TileDirective implements OnInit, OnDestroy {

  // tile
  @Input() tile: Tile;

  // represents the tile's position in the html rows and columns
  @Input() columnIndex: number;
  @Input() rowIndex: number;

  private movementListener;
  private zSetListener;
  private left: number;
  private top: number;

  constructor(private renderer: Renderer2,
              private elRef: ElementRef,
              private boardService: BoardService,
              private movementService: MovementService
  ) {
    // renderer is renderer, elRef is elRef, etc. generates an instance of BoardService
  }

  ngOnInit() {
    // gets index of given value by finding b in 2^b = value
    const index: number = Math.log(this.tile.value)/Math.log(2);
    // sets background to the boardService's background array
    this.renderer.setStyle(this.elRef.nativeElement, 'background', this.boardService.colours[index]);
    // adds tile class to nativeElement
    this.renderer.addClass(this.elRef.nativeElement, 'tile');

    // if b is equal to 0 (value === 1)
    if (index === 0) {
      this.renderer.addClass(this.elRef.nativeElement, 'empty');
      // sets it so the value "1" doesn't appear on webpage
      this.renderer.setProperty(this.elRef.nativeElement, 'innerHTML', '');
    }
    // if newly created tile (assigned in boardService)

    // sets dynamic top and left offsets according to tile position on board

    this.top = this.rowIndex*75
    this.left = this.columnIndex*75;

    // sets position and z-index
    this.renderer.setStyle(this.el, 'position', 'absolute');
    this.renderer.setStyle(this.el, 'z-index', 1);

    this.movementListener = this.movementService.movementEmitters[this.rowIndex][this.columnIndex].subscribe( (directions) => {
      // for math
      const movementCoefficients = {top: 1, left: 1};
      // newPos variable because it was getting UNREADABLE UP IN HERE
      let newPos = 0;
      switch (directions.dir) {
        case 'up':
          // reverses movement offset for determining new position
          movementCoefficients.top *= -1;
        case 'down':
          // gets new position by offsetting by movement length multiplied by tile height
          newPos = this.top + movementCoefficients.top * directions.movement.length * 75;
          transition.begin(this.el, `top ${this.top}px ${newPos}px ease-out ${this.boardService.GLOBAL_CONSTANTS.animationDelay}ms`);
          break;
        case 'left':
          // reverses movement offset for determining new position
          movementCoefficients.left *= -1;
        case 'right':
          // gets new position by offsetting by movement length multiplied by tile width
          newPos = this.left + (movementCoefficients.left * directions.movement.length * 75);
          transition.begin(this.el, `left ${this.left}px ${newPos}px ease-out ${this.boardService.GLOBAL_CONSTANTS.animationDelay}ms`);
        break;
      }
      // once movement is done set z-index to 1
      this.renderer.setStyle(this.el, 'z-index', 1);
    });

    this.zSetListener = this.movementService.zSetEmitters[this.rowIndex][this.columnIndex].subscribe( (z) => {
      // just to set all the z-indexes easily.
      this.renderer.setStyle(this.el, 'z-index', z);
    })


    if (this.tile.isNew) {
      // starts it out transparent, small, and centered, then grows and makes it opaque.
      transition.begin(this.el,
        [
          'opacity 0.25 1 0.25s linear',
          'width 35px 75px 0.25s linear',
          'height 35px 75px 0.25s linear',
          `left ${this.left + 20}px ${this.left}px 0.25s linear`,
          `top ${this.top + 20}px ${this.top}px 0.25s linear`,
        ]
      )
    }
    else {
      this.setPositions();
    }
  }

  setPositions(): void {

    this.renderer.setStyle(this.el, 'top', `${this.top}px`);
    this.renderer.setStyle(this.el, 'left', `${this.left}px`);
  }

  // setBorders() {
  //   // defines border styling, since it's constant
  //   const border = '1px solid black';

  //   // if at top
  //   if (this.rowIndex === 0) {
  //     this.renderer.setStyle(this.elRef.nativeElement, 'border-top', border);
  //   }
  //   // if at bottom
  //   if (this.rowIndex === 3) {
  //     this.renderer.setStyle(this.elRef.nativeElement, 'border-bottom', border);
  //   }
  //   // if at left
  //   if (this.columnIndex === 0) {
  //     this.renderer.setStyle(this.elRef.nativeElement, 'border-left', border);
  //   }
  //   // if at right
  //   if (this.columnIndex === 3) {
  //     this.renderer.setStyle(this.elRef.nativeElement, 'border-right', border);
  //   }
  // }

  get el() {
    return this.elRef.nativeElement;
  }

  ngOnDestroy(): void {
    this.movementListener.unsubscribe();
  }
}
