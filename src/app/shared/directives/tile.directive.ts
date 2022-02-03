import { Directive, Input, Renderer2, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { BoardService } from '../services/board.service';
import { MovementService } from '../services/movement.service';
import { Tile } from '../templates/tile.template';
import * as transition from '../libraries/transition.min.js'
import { Dir } from '../templates/board.template';
import { Subscription } from 'rxjs';
import { boardStylings, constants } from '../libraries/constants';
import { ThemeService } from '../services/theme.service';
import { startWith, tap } from 'rxjs/operators';

@Directive({
  selector: '[TileDirective]'
})

export class TileDirective implements OnInit, OnDestroy {
  @Input() tile: Tile;
  @Input() index: number;

  private movementListener: Subscription;
  private zSetListener: Subscription;

  private left: number;
  private top: number;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private boardService: BoardService,
    private movementService: MovementService,
    private themeService: ThemeService
    ) {
      this.themeService.themeChange.pipe(
        startWith(this.boardService.theme),
        tap(() => this.styleGameTile())
      ).subscribe();
    }

  ngOnInit() {
    this.styleGameTile();

    if (this.tile.value === 1) {
      this.renderer.addClass(this.el, 'empty');

      this.renderer.setProperty(this.el, 'innerHTML', '');
    }

    this.top = this.rowIndex * (constants.tiles.height + constants.board.margin)
      + (constants.board.border / 2);
    this.left = this.columnIndex * (constants.tiles.width + constants.board.margin)
      + (constants.board.border / 2);

    // sets position and z-index
    this.renderer.setStyle(this.el, 'position', 'absolute');
    this.renderer.setStyle(this.el, 'z-index', 1);

    this.movementListener = this.movementService.movementEmitters[this.rowIndex][this.columnIndex].subscribe(directions => {
      const length = directions.movement.length;
      const delay = constants.transitions.length;

      const movementOffset = {
        width: length * constants.tiles.width + length * constants.board.margin,
        height: length * constants.tiles.height + length * constants.board.margin
      };

      let newPosition = 0;
      let movementCoefficient = 1;


      switch (directions.dir) {
        case Dir.UP:
          // reverses movement offset for determining new position
          movementCoefficient = -1;
        case Dir.DOWN:
          // gets new position by offsetting by movement length multiplied by tile height
          newPosition = this.top + movementCoefficient * movementOffset.height;

          if (directions.movement.indexOf('merger') > -1) {
            setTimeout(() => {this.simulateMergedTile()}, delay * length);
          }

          transition.begin(this.el, `top ${this.top}px ${newPosition}px linear ${delay * length}ms`);
          break;
        case Dir.LEFT:
          movementCoefficient = -1;
        case Dir.RIGHT:
          newPosition = this.left + (movementCoefficient * movementOffset.width);
          if (directions.movement.indexOf('merger') > -1) {
            setTimeout(() => {this.simulateMergedTile()}, delay * length);
          }
          transition.begin(this.el, `left ${this.left}px ${newPosition}px linear ${delay * length}ms`);
        break;
      }  
    });

    this.zSetListener = this.movementService.zSetEmitters[this.rowIndex][this.columnIndex].subscribe(z => {
      this.renderer.setStyle(this.el, 'z-index', z);
    });

    if (this.tile.isNew) {
      // starts it out transparent, small, and centered, then grows and makes it opaque.
      const startingSize = {
        width: 35,
        height: 35
      };

      transition.begin(this.el,
        [
          'opacity 0.25 1 0.25s linear',
          `width ${startingSize.width}px ${constants.tiles.width}px 0.25s linear`,
          `height ${startingSize.height}px ${constants.tiles.height}px 0.25s linear`,
          `left ${this.left + ((constants.tiles.width - startingSize.width) / 2)}px ${this.left}px 0.25s linear`,
          `top ${this.top + ((constants.tiles.height - startingSize.height) / 2)}px ${this.top}px 0.25s linear`
        ]
      )
    }
    else {
      this.setPositions();
    }
  }

  simulateMergedTile() {
    const nextLevelTileValue = this.tileValueWorth + 1; 

    this.styleGameTile(nextLevelTileValue);

    this.renderer.setProperty(this.el, 'innerHTML', String(this.tile.value * 2));
    this.renderer.setStyle(this.el, 'z-index', 30);
  }

  setPositions(): void {
    this.renderer.setStyle(this.el, 'top', `${this.top}px`);
    this.renderer.setStyle(this.el, 'left', `${this.left}px`);
    this.renderer.setStyle(this.el, 'width', constants.tiles.width + 'px');
    this.renderer.setStyle(this.el, 'height', constants.tiles.height + 'px');
  }

  private styleGameTile(tileValue?: number) {
    const tileStyle = this.boardService.colours[tileValue ?? this.tileValueWorth];

    for (const styling in tileStyle) {
      this.renderer.setStyle(this.el, styling, tileStyle[styling]);
    }
  }

  get el() {
    return this.elRef.nativeElement;
  }

  ngOnDestroy(): void {
    this.movementListener.unsubscribe();
    this.zSetListener.unsubscribe();
  }

  get columnIndex() {
    return Math.floor(this.index % constants.board.width);
  }

  get rowIndex() {
    return Math.floor(this.index / constants.board.width);
  }

  get tileValueWorth() {
    return Math.log(this.tile?.value ?? 1) / Math.log(2);
  }
}
