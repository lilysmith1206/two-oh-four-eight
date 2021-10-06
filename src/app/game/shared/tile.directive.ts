import { Directive, Input, Renderer2, ElementRef, HostListener, OnInit } from '@angular/core';
import { BoardService } from './board.service';

@Directive({
  selector: '[TileDirective]'
})
export class TileDirective implements OnInit{

  // tile value
  @Input() value: number;

  // represents the tile's position in the html rows and columns
  @Input() columnIndex: number;
  @Input() rowIndex: number;

  constructor(private renderer: Renderer2, private elRef: ElementRef, private boardService: BoardService) {
    // renderer is renderer, elRef is elRef, etc. generates an instance of BoardService
  }

  ngOnInit() {
    // gets index of given value by finding b in 2^b = value
    const index: number = Math.log(this.value)/Math.log(2);
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

    this.setBorders();
  }

  setBorders() {
    // checks if the tile doesn't sit up against the edge of the container; if it doesn't; draw the corresponding border
    if (this.columnIndex !== 0) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-left', 'none');
    }
    if (this.columnIndex !== 3) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-right', 'none');
    }

    if (this.rowIndex !== 0) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-top', 'none');
    }
    if (this.rowIndex !== 3) {
      this.renderer.setStyle(this.elRef.nativeElement, 'border-bottom', 'none');
    }
    // ignore this, dumb code. saved it in case it might be useful later.
    // const siblings: HTMLCollection = this.renderer.parentNode(this.elRef.nativeElement).children;
    // for (let i = 0; i < siblings.length; i++) {
    //   console.log(siblings.item(i), this.elRef.nativeElement);
    //   console.log(siblings.item(i).isEqualNode(this.elRef.nativeElement));
    // }
    // if (this.renderer.nextSibling(this.elRef.nativeElement).innerHTML === '') {
    //   this.renderer.setStyle(this.elRef.nativeElement, 'border-right', 'none');
    // }
    // if (this.renderer.parentNode(this.elRef.nativeElement).children[index].innerHTML === '') {
    //   this.renderer.setStyle(this.elRef.nativeElement, 'border-right', 'none');
    // }


  // @HostListener('click') onClick() {
  //   console.log('focused on tile', this.columnIndex, this.rowIndex)
  // }

  }
}
