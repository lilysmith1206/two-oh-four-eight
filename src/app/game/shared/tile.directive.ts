import { Directive, Input, Renderer2, ElementRef, HostListener, OnInit } from '@angular/core';
import { BoardService } from './board.service';
import { Tile } from './tile.template';

@Directive({
  selector: '[TileDirective]'
})
export class TileDirective implements OnInit{

  // tile
  @Input() tile: Tile;

  // represents the tile's position in the html rows and columns
  @Input() columnIndex: number;
  @Input() rowIndex: number;

  constructor(private renderer: Renderer2, private elRef: ElementRef, private boardService: BoardService) {
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
    if (this.tile.isNew) {
      // check game.component.css for details on creation animation
      this.renderer.addClass(this.elRef.nativeElement, 'create');
    }

    this.setBorders();
  }

  setBorders() {
    // defines border styling, since it's constant
    const border = '1px solid black';

    // if at top
    if (this.rowIndex === 0) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-top', border);
    }
    // if at bottom
    if (this.rowIndex === 3) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-bottom', border);
    }
    // if at left
    if (this.columnIndex === 0) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-left', border);
    }
    // if at right
    if (this.columnIndex === 3) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-right', border);
    }
  }
}
